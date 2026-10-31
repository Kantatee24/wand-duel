// three.js's CJS entry (node_modules/three/build/three.cjs) calls process.emitWarning()
// to warn that require('three') is deprecated in favor of ESM import. React Native's
// `process` polyfill doesn't implement emitWarning, so requiring three.js (pulled in by
// @react-three/fiber) crashes at load time with "undefined is not a function" before the
// app even renders. Must be imported first, before anything that touches three.js.
if (typeof process !== 'undefined' && typeof process.emitWarning !== 'function') {
  process.emitWarning = () => {};
}
