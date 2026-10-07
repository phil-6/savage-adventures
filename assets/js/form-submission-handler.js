(function () {

    // Each form owns one Turnstile widget; its ID is needed to reset that widget after a failed submit.
    var turnstileWidgetIds = new WeakMap();

    function getFormData(form) {
        var data = {};
        var honeypot = '';
        var elements = form.elements;

        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (!el.name || el.name === 'cf-turnstile-response') continue;
            if (el.name === 'honeypot') {
                honeypot = el.value;
                continue;
            }
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (el.checked) data[el.name] = el.value;
            } else {
                data[el.name] = el.value;
            }
        }

        // Include Turnstile token
        var turnstileInput = form.querySelector('input[name="cf-turnstile-response"]');
        if (turnstileInput) {
            data['cf-turnstile-response'] = turnstileInput.value;
        }

        return { data: data, honeypot: honeypot };
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        var form = event.target;
        var formData = getFormData(form);

        // Honeypot filled — silently bail
        if (formData.honeypot) return false;

        disableAllButtons(form);
        showSpinner(form);

        var url = form.action;

        try {
            var response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData.data)
            });

            if (response.status === 204) {
                // Honeypot triggered server-side — show fake success
                showSuccess(form, 'Thanks for your enquiry!');
                return;
            }

            var result = await response.json();

            if (response.ok) {
                showSuccess(form, result.message || 'Thanks for your enquiry!');
            } else if (response.status === 429) {
                showError(form, 'Too many requests. Please try again in a few minutes.');
            } else if (response.status === 403) {
                showError(form, 'Verification failed. Please complete the challenge and try again.');
            } else {
                showError(form, result.error || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            showError(form, 'Network error. Please check your connection and try again.');
        }
    }

    function loaded() {
        var forms = document.querySelectorAll('form.gform');
        for (var i = 0; i < forms.length; i++) {
            forms[i].addEventListener('submit', handleFormSubmit, false);
        }
    }

    document.addEventListener('DOMContentLoaded', loaded, false);

    // Called by api.js (?render=explicit&onload=onTurnstileLoad) once Turnstile is ready.
    window.onTurnstileLoad = function () {
        var forms = document.querySelectorAll('form.gform');
        for (var i = 0; i < forms.length; i++) {
            renderTurnstile(forms[i]);
        }
    };

    function renderTurnstile(form) {
        var container = form.querySelector('.turnstile-widget');
        if (!container || turnstileWidgetIds.has(form)) return;

        var submitBtn = form.querySelector('button[type="submit"]');
        function setSubmitEnabled(enabled) {
            if (submitBtn) submitBtn.disabled = !enabled;
        }

        var widgetId = turnstile.render(container, {
            sitekey: container.dataset.sitekey,
            action: container.dataset.action,
            size: container.dataset.size,
            callback: function () { setSubmitEnabled(true); },
            'expired-callback': function () { setSubmitEnabled(false); },
            'error-callback': function () { setSubmitEnabled(false); }
        });
        turnstileWidgetIds.set(form, widgetId);
    }

    // Tokens are single-use, so every failed attempt needs a fresh one. The submit button stays
    // disabled until this form's widget issues it.
    function resetTurnstile(form) {
        var widgetId = turnstileWidgetIds.get(form);
        if (widgetId !== undefined && typeof turnstile !== 'undefined') {
            turnstile.reset(widgetId);
        }
    }

    function disableAllButtons(form) {
        var buttons = form.querySelectorAll('button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }

    function showSuccess(form, message) {
        hideSpinner(form);
        var formElements = form.querySelector('.form-elements');
        if (formElements) formElements.style.display = 'none';
        var thankYou = form.querySelector('.thankyou_message');
        if (thankYou) {
            var h2 = thankYou.querySelector('h2');
            if (h2) h2.textContent = message;
            thankYou.style.display = 'block';
        }
    }

    function showError(form, message) {
        hideSpinner(form);
        var formElements = form.querySelector('.form-elements');
        if (formElements) formElements.classList.remove('d-none');
        var existing = form.querySelector('.form-error');
        if (existing) existing.remove();
        var errorDiv = document.createElement('div');
        errorDiv.className = 'form-error alert alert-danger mt-2';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = message;
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(errorDiv, submitBtn);
        }
        resetTurnstile(form);
    }

    function showSpinner(form) {
        var spinner = form.querySelector('.form-spinner');
        if (spinner) {
            spinner.classList.remove('d-none');
            spinner.classList.add('d-inline-block');
        }
        var formElements = form.querySelector('.form-elements');
        if (formElements) formElements.classList.add('d-none');
    }

    function hideSpinner(form) {
        var spinner = form.querySelector('.form-spinner');
        if (spinner) {
            spinner.classList.add('d-none');
            spinner.classList.remove('d-inline-block');
        }
        var formElements = form.querySelector('.form-elements');
        if (formElements) formElements.classList.remove('d-none');
    }
})();
