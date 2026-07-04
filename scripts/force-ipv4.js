// Force IPv4 DNS resolution to work around Cloudflare TLS handshake issue with Node.js IPv6
const dns = require('dns');
const orig = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  return orig.call(this, hostname, { ...options, family: 4 }, callback);
};
