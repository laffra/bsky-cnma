const body = $('body');
const root = $('#root');

let current = -1;

function getVisibleItems() {
    try {
        return $('button[data-testid="replyBtn"]').filter(function () {
            return $(this).is(':visible');
        }).map(function () {
            return $(this).parent().parent().parent().parent().parent();
        });
    } catch (e) {
        console.log("bsky-cnma: Cannot get visible items", e);
    }
}

function hideAllItems() {
    try {
        getVisibleItems().each(function (index, element) {
            $(element).css({
                margin: "",
                opacity: 0
            })
        })
    } catch (e) {
        console.log("bsky-cnma: Cannot hide visible items", e);
    }
}

function showAllItems() {
    try {
        getVisibleItems().each(function (index, element) {
            $(element).css({ opacity: 1 })
        })
    } catch (e) {
        console.log("bsky-cnma: Cannot show visible items", e);
    }
}

function getPostURL(item) {
    for (link of item.find("a")) {
        if (link.href.includes("/post/")) {
            return link.href.replace("https://bsky.app/profile/", "");
        }
    }
    return "";
}

function getContentURL(item) {
    for (link of item.find("a")) {
        if (!link.href.includes("/bsky.app/profile/")) {
            console.log("bsky-cnma: Found link", link.href);
            return link.href;
        }
    }
    return "#";
}

function getReadKey(item) {
    return `cnma-${getPostURL(item)}`;
}

function alreadyRead(item) {
    try {
        return localStorage.getItem(getReadKey(item)) !== null;
    } catch (e) {
        console.log("bsky-cnma: Cannot mark check if item was already read", item, e);
    }
}

function markAsRead(item) {
    try {
        localStorage.setItem(getReadKey(item), new Date().getTime() / 1000);
    } catch (e) {
        console.log("bsky-cnma: Cannot mark item as read", item, e);
    }
}

function cleanupLocalStorage() {
    const now = new Date().getTime() / 1000;
    const expirationSeconds = 60 * 60 * 24; // one day
    for (let key of Object.keys(localStorage)) {
        if (key.startsWith("cnma-")) {
            const when = parseFloat(localStorage.getItem(key));
            if (now - when > expirationSeconds) {
                localStorage.removeItem(key);
            }
        }
    }
}

function highlight(item) {
    console.log("Highlight:", alreadyRead(item), getPostURL(item));
    $('#cinema-welcome').css("opacity", 0);
    $('button[aria-label="Back"]').click()
    $('button[aria-label="New post"]').css("display", "none");
    $('button[aria-label="Load new posts"]').css("display", "none");
    item.css({
        width: "85vw",
        maxWidth: 1024,
        background: root.css("--background"),
        zIndex: 100000,
        opacity: 1,
        overflow: "hidden",
        paddingTop: 10,
        paddingRight: 50,
        height: "100vh",
    })
    item.css({
        marginLeft: -item.offset().left + (body.width() - item.width()) / 2 + 15
    })
    markAsRead(item);
    showPreview(getContentURL(item));
    $(document).scrollTop(item.offset().top - 3)
}

function unhighlight() {
    $('button[aria-label="Load new posts"]').css("display", "block");
    $('button[aria-label="New post"]').css("display", "block");
    getVisibleItems().each(function (index, element) {
        $(element).css({
            width: "100%",
            opacity: 1,
            padding: 0,
            margin: 0,
            height: "100%",
        })
    });
}

function showPreview(url) {
    try {
        console.log("bsky-cnma: Showing preview", url);
        (async () => {
            await chrome.runtime.sendMessage({preview: url});
        })();
    } catch (e) {
        console.log("bsky-cnma: Cannot preview", url, e);
    }
}

function showCurrent() {
    try {
        showPreview("");
        hideAllItems();
        hideNavigation()
        highlight(getVisibleItems().get(current));
    } catch (e) {
        console.log("bsky-cnma: Cannot show current", current, e);
        setTimeout(showCurrent, 1000); // try again on newly loaded posts
    }
}

function showNextUnread() {
    try {
        item = getVisibleItems().get(++current);
        if (alreadyRead(item)) {
            setTimeout(showNextUnread, 1);
        }
        showCurrent();
    } catch (e) {
        console.log("bsky-cnma: Cannot show next unread", current, e);
        setTimeout(showCurrent, 1000); // try again on newly loaded posts
    }
}

function hideNavigation() {
    try {
        $('div[role="tablist"]').parent().animate({ top: -50 });
        $('nav[role="navigation"]')
            .css("visibility", "hidden")
            .next().css("visibility", "hidden")
    } catch (e) {
        console.log("bsky-cnma: Cannot hide navigation", e);
    }
}

function reset() {
    showAllItems();
    showNavigation();
    unhighlight();
    current = -1;
}

function showNavigation() {
    try {
        $('div[role="tablist"]').parent().css({ top: 0 });
        $('nav[role="navigation"]')
            .css("visibility", "visible")
                   .css("visibility", "visible")
    } catch (e) {
        console.log("bsky-cnma: Cannot show navigation", e);
    }
}

function like() {
    try {
        getVisibleItems().get(current).find('button[data-testid="likeBtn"]').click()
    } catch (e) {
        console.log("bsky-cnma: Cannot like", e);
    }
}

function isEditorEvent(event) {
    return $(event.target).attr("contenteditable") === "true";
}

function handleKeydown(event) {
    if (isEditorEvent(event)) {
        return;
    }
    console.log("bsky-cnma: keydown", event.key);
    switch (event.key) {
        case 'Escape':
            reset()
            break;
        case 'l':
            like();
            break;
        case '?':
            console.log("show cinema welcome")
            $('#cinema-welcome').animate({"opacity": 1});
            break;
        case 'i':
        case 'c':
        case 'ArrowDown':
            getVisibleItems().get(current).click();
            break;
        case 'j':
        case 'ArrowRight':
            showNextUnread()
            break;
        case 'k':
        case 'ArrowLeft':
            current = Math.max(0, current - 1);
            showCurrent()
            break;
    }
}

function character(c) {
    return `
        <div
            style="border:1px solid white; display:inline; width:fit-content; padding:0 4px; font-size:10px;"
        >
            ${c}
        </div>
    `
}

body.append(
    $(`
<div 
    id="cinema-welcome" 
    style="background:#0085ff; opacity: 0; color:#eee; font-size:12px; border-radius:10px; padding:10px; position:fixed; bottom:0; left:10px; z-index:100000;"
>
    <center style="font-size:16px; font-weight:bold; margin-bottom:10px;">
    Bluesky 🍿 Cinema<br>
    </center>
    <table style="border:1px solid #eee">
        <tr>
            <td> Next</td>
            <td> ${character('j')} or ${character('ArrowRight')}</td>
        </tr>
        <tr>
            <td> Previous</td>
            <td> ${character('k')} or ${character('ArrowLeft')}</td>
        </tr>
        <tr>
            <td>Like</td>
            <td> ${character('l')}</td>
        </tr>
        <tr>
            <td> Comments</td>
            <td> ${character('i')} or ${character('c')} or ${character('ArrowUp')}</td>
        </tr>
        <tr>
            <td>Reset</td>
            <td> ${character('Escape')}</td>
        </tr>
    </table>
    <center style="font-size:10px; color:#f8fd1f; margin-top:10px;">
        <a href=https://github.com/laffra/bsky-cnma/blob/main/cinema.js>source code</a>
    </center>
</div>
    `)
)

$(document).on('keydown', handleKeydown);

setTimeout(() => {
    $('#cinema-welcome').animate({"opacity": 1}, 2000);
}, 1000);
setTimeout(() => {
    $('#cinema-welcome').animate({"opacity": 0}, 1000);
}, 5000);

cleanupLocalStorage();

console.log(
    "Bluesky Cinema Extension Activated:",
    "https://chromewebstore.google.com/detail/bluesky-cinema/lclldibgmnonflnoabginkmidpkljgop"
)