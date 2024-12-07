const body = $('body');
const root = $('#root');

let current = -1;
    
function getVisibleItems() {
    return $('button[data-testid="replyBtn"]').filter(function() {
        return $(this).is(':visible');
    }).map(function() {
        return $(this).parent().parent().parent().parent();
    });
}
    
function hideAllItems() {
    getVisibleItems().each(function(index, element) {
        $(element).css({
            margin: "",
            opacity: 0
        })
    })
    $("div").css({
        borderColor: "transparent",
    })
}

function highlight(item) {
    $('#cinema-welcome').remove();
    $('button[aria-label="Back"]').click()
    $('button[aria-label="Load new posts"]').remove()
    item.css({
        width: "85vw",
        maxWidth: 1024,
        background: root.css("--background"),
        zIndex: 100000,
        opacity: 1,
        overflow: "hidden",
        paddingTop: 10,
        paddingRight: 50,
        border: "2px solid lightblue",
    })
    item.css({
        marginLeft: -item.offset().left + (body.width() - item.width())/2 + 15
    })
    item.parent().css("border-color", "traansparent")
    if (!item.offset()) return;
    $(document).scrollTop(item.offset().top - 3)
}

function showCurrent() {
    hideAllItems();
    hideNavigation()
    highlight(getVisibleItems().get(current));
}

function hideNavigation() {
    $('div[role="tablist"]').parent().animate({ top: -50 });
    $('nav[role="navigation"]')
        .css("visibility", "hidden")
        .next().css("visibility", "hidden")
}

function reset() {
    window.location.reload();
}

$(document).on('keydown', function(event) {
  if (event.target !== document.body) {
    return;
  }
  switch (event.key) {
    case 'Escape':
      reset();
      break;
    case 'i':
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
});

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
    style="background:#3f77fb; color:#eee; font-size:12px; border-radius:10px; padding:10px; position:fixed; bottom:0; left:10px; z-index:100000;"
>
    <div style="font-size:16px; font-weight:bold; margin-bottom:10px;">
    🍿 Bluesky Cinema<br>
    </div>
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
            <td> Comments</td>
            <td> ${character('i')} or ${character('ArrowUp')}</td>
        </tr>
        <tr>
            <td>Reset</td>
            <td> ${character('Escape')}</td>
        </tr>
    </table>
    <center style="font-size:10px; color:#bbb; margin-top:10px;">
        <a href=https://github.com/laffra/bsky-cinema/cinema.js>github.com/laffra/bsky-cnma</a>
    </center>
</div>
    `)
)
console.log($('#cinema-welcome').text())   