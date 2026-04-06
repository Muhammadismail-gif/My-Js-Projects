$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // smooth scrolling

    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    })
});

// fetch projects
const projectsContainer = document.getElementById('projects-container');
let project = '';

fetch('./Assets/js/projects.json')
    .then(res => res.json())
    .then(projects => {
        // console.log(projects);

        projects.forEach(proj => {
            // console.log(proj);
            project += `
    <div class="box">
        <img src="./Assets/Pictures/Projects_Images/${proj.meta}.png" alt="project">
        <div class="content">
        <h3>${proj.name}</h3>
        <p>${proj.desc}</p>
        <div class="btns">
            <a href="Basic_Projects/${proj.meta}" class="btn"><i class="fas fa-eye"></i> View</a>
            <a href="https://github.com/Muhammadismail-gif/My-Js-Projects/tree/main/Basic_Projects/${proj.meta}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>
        </div>
        </div>
    </div>`;
        });
        projectsContainer.innerHTML = project;
    });

