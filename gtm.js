/**
 * Google Tag Manager initialization script
 * 
 * This file is loaded in the HTML to initialize Google Tag Manager
 * with the GTM container ID: GTM-5L7PTHJK
 */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// Define the gtag function
function gtag(){dataLayer.push(arguments);}

// Initialize GTM with the appropriate container ID
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5L7PTHJK');