const { initTracer } = require('jaeger-client');

const { version } = require('../package.json');

const config = {
  serviceName: 'INITIATION-WORKFLOW',
  reporter: {
    logSpans: true,
    agentHost: process.env.JAEGER_HOST,
    agentPort: parseInt(process.env.JAEGER_PORT)
  },
  sampler: {
    type: 'probabilistic',
    param: 1.0
  }
};

const options = {
  tags: {
    'INITIATION-WORKFLOW.version': version
  }
};

/*******************************************************************
 * `BELOW CONSTANTS ARE ADDED FROM THE OPENTRACING version 0.14.4` *
 ******************************************************************/

/**
* The FORMAT_BINARY format represents SpanContexts in an opaque binary
* carrier.
*
* Tracer.inject() will set the buffer field to an Array-like (Array,
* ArrayBuffer, or TypedBuffer) object containing the injected binary data.
* Any valid Object can be used as long as the buffer field of the object
* can be set.
*
* Tracer.extract() will look for `carrier.buffer`, and that field is
* expected to be an Array-like object (Array, ArrayBuffer, or
* TypedBuffer).
*/
const FORMAT_BINARY = 'binary';

/**
 * The FORMAT_TEXT_MAP format represents SpanContexts using a
 * string->string map (backed by a Javascript Object) as a carrier.
 *
 * NOTE: Unlike FORMAT_HTTP_HEADERS, FORMAT_TEXT_MAP places no restrictions
 * on the characters used in either the keys or the values of the map
 * entries.
 *
 * The FORMAT_TEXT_MAP carrier map may contain unrelated data (e.g.,
 * arbitrary gRPC metadata); as such, the Tracer implementation should use
 * a prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
const FORMAT_TEXT_MAP = 'text_map';

/**
 * The FORMAT_HTTP_HEADERS format represents SpanContexts using a
 * character-restricted string->string map (backed by a Javascript Object)
 * as a carrier.
 *
 * Keys and values in the FORMAT_HTTP_HEADERS carrier must be suitable for
 * use as HTTP headers (without modification or further escaping). That is,
 * the keys have a greatly restricted character set, casing for the keys
 * may not be preserved by various intermediaries, and the values should be
 * URL-escaped.
 *
 * The FORMAT_HTTP_HEADERS carrier map may contain unrelated data (e.g.,
 * arbitrary HTTP headers); as such, the Tracer implementation should use a
 * prefix or other convention to distinguish Tracer-specific key:value
 * pairs.
 */
const FORMAT_HTTP_HEADERS = 'http_headers';

/**
 * A Span may be the "child of" a parent Span. In a “child of” reference,
 * the parent Span depends on the child Span in some capacity.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
const REFERENCE_CHILD_OF = 'child_of';

/**
 * Some parent Spans do not depend in any way on the result of their child
 * Spans. In these cases, we say merely that the child Span “follows from”
 * the parent Span in a causal sense.
 *
 * See more about reference types at https://github.com/opentracing/specification
 */
const REFERENCE_FOLLOWS_FROM = 'follows_from';

module.exports = {
  TRACER: initTracer(config, options),
  FORMAT_BINARY,
  FORMAT_TEXT_MAP,
  FORMAT_HTTP_HEADERS,
  REFERENCE_CHILD_OF,
  REFERENCE_FOLLOWS_FROM,
};