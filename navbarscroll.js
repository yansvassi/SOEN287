function changeBg()
{
    var scrollValue = window.scrollY;
    var navbar = document.getElementById('nav1');
    console.log(scrollValue);
    if(scrollValue < 150)
        {
            navbar.classList.remove('navColor');
        }
    else{
        navbar.classList.add('navColor');
    }
}

window.addEventListener('scroll', changeBg);