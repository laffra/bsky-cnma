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

function highlight(item) {
    try {
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
        if (!item.offset()) return;
        
        $(document).scrollTop(item.offset().top - 3)
    } catch (e) {
        console.log("bsky-cnma: Cannot highlight", item, e);
    }
}

function unhighlight() {
    try {
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
    } catch (e) {
        console.log("bsky-cnma: Cannot unhighlight", e);
    }
}

function showCurrent() {
    try {
        hideAllItems();
        hideNavigation()
        highlight(getVisibleItems().get(current));
    } catch (e) {
        console.log("bsky-cnma: Cannot show current", current, e);
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
            current++;
            showCurrent()
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
    $('#cinema-welcome').animate({"opacity": 1});
}, 1000);
setTimeout(() => {
    $('#cinema-welcome').animate({"opacity": 0});
}, 5000);

console.log(
    "Bluesky Cinema Extension Activated:",
    "https://chromewebstore.google.com/detail/bluesky-cinema/lclldibgmnonflnoabginkmidpkljgop"
)