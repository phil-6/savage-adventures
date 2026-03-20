(function () {

    // get all data in form and return object
    function getFormData(form) {
        let elements = form.elements;
        let honeypot;

        let fields = Object.keys(elements).filter(function (k) {
            if (elements[k].name === "honeypot") {
                honeypot = elements[k].value;
                return false;
            }
            return true;
        }).map(function (k) {
            if (elements[k].name !== undefined) {
                return elements[k].name;
                // special case for Edge's html collection
            } else if (elements[k].length > 0) {
                return elements[k].item(0).name;
            }
        }).filter(function (item, pos, self) {
            return self.indexOf(item) === pos && item;
        });

        let formData = {};
        fields.forEach(function (name) {
            let element = elements[name];

            // singular form elements just have one value
            formData[name] = element.value;

            // when our element has multiple items, get their values
            if (element.length) {
                let data = [];
                for (let i = 0; i < element.length; i++) {
                    let item = element.item(i);
                    if (item.checked || item.selected) {
                        data.push(item.value);
                    }
                }
                formData[name] = data.join(', ');
            }
        });

        // add form-specific values into the data
        formData.formDataNameOrder = JSON.stringify(fields);
        formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
        formData.formGoogleSend = form.dataset.email || ""; // no email by default

        return {data: formData, honeypot};
    }

    function handleFormSubmit(event) {  // handles form submit without any jquery
        event.preventDefault();           // we are submitting via xhr below
        let form = event.target;
        let formData = getFormData(form);
        let data = formData.data;

        // If a honeypot field is filled, assume it was done so by a spam bot.
        if (formData.honeypot) {
            return false;
        }

        disableAllButtons(form);
        showSpinner(form);
        let url = form.action;
        let xhr = new XMLHttpRequest();
        let timeoutDuration = 5000;

        let timeout = setTimeout(function () {
            resetForm(form);
        }, timeoutDuration);

        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                clearTimeout(timeout);
                if (xhr.status === 200) {
                    resetForm(form);
                } else if (xhr.status !== 0) {
                    hideSpinner(form);
                    alert("Form submission failed. Please try again.");
                    let buttons = form.querySelectorAll("button");
                    for (let i = 0; i < buttons.length; i++) {
                        buttons[i].disabled = false;
                    }
                }
            }
        };
        // url encode form data for sending as post data
        let encoded = Object.keys(data).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
        }).join('&');
        xhr.send(encoded);
    }

    function loaded() {
        // bind to the submit event of our form
        let forms = document.querySelectorAll("form.gform");
        for (let i = 0; i < forms.length; i++) {
            forms[i].addEventListener("submit", handleFormSubmit, false);
        }
    }

    document.addEventListener("DOMContentLoaded", loaded, false);

    function disableAllButtons(form) {
        let buttons = form.querySelectorAll("button");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }

    function resetForm(form) {
        form.reset();
        hideSpinner(form);
        let formElements = form.querySelector(".form-elements");
        if (formElements) {
            formElements.style.display = "none"; // hide form
        }
        let thankYouMessage = form.querySelector(".thankyou_message");
        if (thankYouMessage) {
            thankYouMessage.style.display = "block";
        }
    }

    function showSpinner(form) {
        let spinner = form.querySelector('.form-spinner');
        if (spinner) {
            spinner.classList.remove('d-none');
            spinner.classList.add('d-inline-block');
        }
        let formElements = form.querySelector('.form-elements');
        if (formElements) {
            formElements.classList.add('d-none');
        }
    }

    function hideSpinner(form) {
        let spinner = form.querySelector('.form-spinner');
        if (spinner) {
            spinner.classList.add('d-none');
            spinner.classList.remove('d-inline-block');
        }
        let formElements = form.querySelector('.form-elements');
        if (formElements) {
            formElements.classList.remove('d-none');
        }
    }
})();

// turnstile
window.onTurnstileSuccess = function (token) {
    const disabledSubmitButtons = document.querySelectorAll('button[type="submit"][disabled]');
    disabledSubmitButtons.forEach(function (button) {
        button.disabled = false;
    });
};
