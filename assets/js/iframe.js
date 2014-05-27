/**
 * iframe.js
 *
 * Provides some conveniences for the initial page of the dev frame, such as recently used URLs.
 */
(function(window) {

  var urls = JSON.parse(localStorage.getItem('urls')) || [],
      urlInput = document.getElementById('url');

  var form = document.getElementById('form');

  form.addEventListener('submit', function(e) {
    var url = urlInput.value;
    if(!url || !url.length) {
      e.preventDefault();
      return;
    }
    if(urls.indexOf(url) == -1) {
      urls.unshift(url);
      urls.length = (urls.length > 5) ? 5 : urls.length;
      localStorage.setItem('urls', JSON.stringify(urls));
    }
    form.action = url;
  });

  if(!urls.length) return;

  urlInput.value = urls[0];
  urlInput.select();

  var recent = document.getElementById('recent'),
      list = document.getElementById('list'),
      clear = document.getElementById('clear');

  urls.forEach(function(url) {
    list.innerHTML += '<p><a href="' + url + '">' + url + '</a></p>';
  });

  clear.addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.clear('urls');
    window.location.reload();
  });

  recent.style.display = 'block';

}(window));