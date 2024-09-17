// JavaScript to switch sections when sidebar links are clicked
const links = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.section');

links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    // Remove 'active' class from all sections
    sections.forEach(section => section.classList.remove('active'));

    // Add 'active' class to the clicked section
    const sectionId = this.getAttribute('data-section');
    document.getElementById(sectionId).classList.add('active');
  });
  link.addEventListener('click', function(e) {
    // Check if the link is for logout
    if (this.getAttribute('data-section') === 'logout') {
        window.location.href='index.html';
    }
  });  
});
