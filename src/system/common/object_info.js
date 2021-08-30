import {assert} from './utils';
import {i18n} from '../../boot/i18n';

export function objectTypeName(object) {
  assert(object && object.type)
  switch (object.type) {
    case 'NODE': return i18n.t('Node')
    case 'JOINT': return i18n.t('Joint')
    case 'WORD': return i18n.t('Sphere')
    case 'SENTENCE': return i18n.t('Sphere')
    case 'CHAR': return i18n.t('Sphere')
    case 'VIDEO': return i18n.t('Video')
    case 'IMAGE': return i18n.t('Image')
    case 'BOOK': return i18n.t('Book')
    case 'BLOCk': return i18n.t('Block')
    case 'USER': return i18n.t('User')
    default: return i18n.t('unknown')
  }
}
export function objectUrl(object) {
  return objectUrlPath(object) + object.oid
}
export function objectUrlPath(object) {
  assert(object && object.type)
  switch (object.type) {
    case 'NODE': return '/node/'
    case 'JOINT': return '/joint/'
    case 'WORD': return '/sphere/'
    case 'SENTENCE': return '/sphere/'
    case 'CHAR': return '/sphere/'
    case 'VIDEO': return '/content/'
    case 'IMAGE': return '/content/'
    case 'BOOK': return '/content/'
    case 'BLOCk': return '/block/'
    case 'USER': return '/user/'
    default: return '/'
  }
}
