function changeBg()
{
    var scrollValue = window.scrollY;
    var navbar = document.getElementById('nav1');

    if(scrollValue < 10)
        {
            navbar.classList.remove('navColor');
        }
    else{
        navbar.classList.add('navColor');
    }
}

window.addEventListener('scroll', changeBg);