$(document).ready(function () {
  $(".about__wrap .about__sublist").hide().prev().click(function() {
    $(this).parents(".about__wrap").find(".about__sublist").not(this).slideUp().prev().removeClass("about__summary--active");
    $(this).next().not(":visible").slideDown().prev().addClass("about__summary--active");
  });
});