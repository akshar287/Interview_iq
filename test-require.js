const reportError = (name, e) => {
  console.error(`--- Error loading ${name} ---`);
  console.error(e.stack || e);
};

try {
  require('jws');
  console.log('jws loaded successfully');
} catch (e) {
  reportError('jws', e);
}

try {
  require('firebase-admin');
  console.log('firebase-admin loaded successfully');
} catch (e) {
  reportError('firebase-admin', e);
}
