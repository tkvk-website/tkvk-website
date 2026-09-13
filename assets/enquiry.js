/* TKVK — inline enquiry form. Posts to the business's own Lambda; no third-party form service. */
(function () {
  var ENDPOINT = 'https://kqshq7av3fcmcdf7wf7vy6ztji0vesax.lambda-url.ap-south-1.on.aws/';

  function init(form) {
    var q = function (n) { var e = form.querySelector('[data-f="' + n + '"]'); return e ? e.value.trim() : ''; };
    var err = form.querySelector('[data-err]');
    var btn = form.querySelector('[data-send]');
    var ar = document.documentElement.lang === 'ar';

    var T = ar ? {
      need: 'يرجى ذكر الدولة والمهنة المطلوبة على الأقل.',
      mail: 'يرجى ترك بريد إلكتروني حتى نرد عليكم.',
      sending: 'جارٍ الإرسال...',
      fail: 'تعذّر الإرسال الآن. يرجى المراسلة على info@tkvk.in أو الاتصال بنا.',
      net: 'تعذّر الوصول إلى الخادم. يرجى المراسلة على info@tkvk.in أو الاتصال بنا.',
      okh: 'شكراً لكم — وصلنا طلبكم.',
      okp: 'نقرأ كل طلب بأنفسنا. ستصلكم إجابة صريحة وشروطنا كتابةً على '
    } : {
      need: 'Please give at least the country and the trade you need.',
      mail: 'Please leave an email address so we can reply.',
      sending: 'Sending...',
      fail: 'Could not send that just now. Please email info@tkvk.in or call us.',
      net: 'Could not reach our server. Please email info@tkvk.in or call us.',
      okh: 'Thank you — your requirement has reached us.',
      okp: 'We read every enquiry ourselves. You will get a straight answer and our terms in writing at '
    };

    var LABELS = [['company', 'Company'], ['country', 'Country'], ['trade', 'Trade needed'],
                  ['workers', 'Number of workers'], ['email', 'Email'], ['phone', 'Phone / WhatsApp']];

    function summary() {
      var out = [];
      for (var i = 0; i < LABELS.length; i++) {
        var v = q(LABELS[i][0]);
        if (v) out.push(LABELS[i][1] + ': ' + v);
      }
      if (q('notes')) out.push('', 'Notes:', q('notes'));
      out.push('', 'Sent from: ' + window.location.pathname);
      return out.join('\n');
    }

    btn.addEventListener('click', async function () {
      if (!q('country') || !q('trade')) { err.textContent = T.need; return; }
      if (!q('email')) { err.textContent = T.mail; return; }
      err.textContent = '';
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = T.sending;
      try {
        var res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _honey: q('honey'),
            _subject: 'TKVK requirement' + (q('country') ? ' — ' + q('country') : '') + (q('trade') ? ' — ' + q('trade') : ''),
            name: q('company') || 'Employer enquiry',
            email: q('email'),
            phone: q('phone'),
            company: q('company'),
            country: q('country'),
            trade: q('trade'),
            workers: q('workers'),
            source: 'tkvk.in' + window.location.pathname,
            message: summary()
          })
        });
        var data = await res.json().catch(function () { return {}; });
        if (res.ok && data.ok !== false) {
          var mail = q('email').replace(/</g, '&lt;');
          form.innerHTML = '<h3>' + T.okh + '</h3><p>' + T.okp + mail + '.</p>';
        } else {
          err.textContent = (data && data.error) ? data.error : T.fail;
          btn.disabled = false; btn.textContent = label;
        }
      } catch (e) {
        err.textContent = T.net;
        btn.disabled = false; btn.textContent = label;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('[data-enquiry]');
    for (var i = 0; i < forms.length; i++) init(forms[i]);
  });
})();
