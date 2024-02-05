import emailjs from "@emailjs/browser";
import $ from "jquery";

let html = `<div style="background-color: ##f2800a;">Hello World!</div>`

var emailjsData = {
service_id: "service_84w6qa9",
template_id: "template_henjvjj",
user_id: "T2STfXJpj4IwgfT4m",
template_params: {	
  user_email: email,
  html: html
};

$.ajax("https://api.emailjs.com/api/v1.0/email/send", {
type: "POST",
data: JSON.stringify(emailjsData),
contentType: "application/json",
})
.done(function () {
  Swal.fire({
    title: "Sign up Success.",
    icon: "success",
    text: "Please check your email to verify your account.",
  });
})
.fail(function (error) {
  alert("Oops... " + JSON.stringify(error));
});


export default function SendEmail({ onSend, setOnsend, data }) {
	

	if(onSend){

	}

	return null

}