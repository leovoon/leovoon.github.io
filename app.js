// darkmode 

const colorizer = document.querySelector("#colorizer")
const icon = document.querySelector('i')

colorizer.onclick = function (e) {

    
    if (localStorage.getItem("theme") === null) {
        localStorage.setItem("theme", "dark");
        document.body.classList.add("night");
        if (icon.classList.contains('fa-lightbulb-o')) {
            icon.classList.remove('fa-lightbulb-o');
            icon.classList.add('fa-moon-o');
            
          } 
          
    } else {

        localStorage.removeItem("theme");
        document.body.classList.remove("night");
        icon.classList.remove('fa-moon-o');
            icon.classList.add('fa-lightbulb-o');
    };
    //e.preventDefault();
};


if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("night");
}

