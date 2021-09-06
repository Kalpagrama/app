import {assert} from './utils';
import {i18n} from '../../boot/i18n';
import { ObjectTypeEnum, WsItemTypeEnum } from 'src/system/common/enums'

export function objectTypeName(object) {
  assert(object && (object.type || object.wsItemType))
  switch (object.type || object.wsItemType) {
    case WsItemTypeEnum.WS_NODE:
    case ObjectTypeEnum.NODE: return i18n.t('Node')
    case WsItemTypeEnum.WS_JOINT:
    case ObjectTypeEnum.JOINT: return i18n.t('Joint')
    case WsItemTypeEnum.WS_SPHERE:
    case ObjectTypeEnum.WORD:
    case ObjectTypeEnum.SENTENCE:
    case ObjectTypeEnum.CHAR: return i18n.t('Sphere')
    case WsItemTypeEnum.WS_CONTENT: return i18n.t('Content')
    case ObjectTypeEnum.VIDEO: return i18n.t('Video')
    case ObjectTypeEnum.IMAGE: return i18n.t('Image')
    case ObjectTypeEnum.BOOK: return i18n.t('Book')
    case WsItemTypeEnum.WS_BLOCK:
    case ObjectTypeEnum.BLOCK: return i18n.t('Block')
    case ObjectTypeEnum.USER: return i18n.t('User')
    default: return i18n.t('unknown')
  }
}
export function objectUrl(object) {
  return objectUrlPath(object) + object.oid
}
export function objectUrlPath(object) {
  assert(object && object.type)
  switch (object.type) {
    case ObjectTypeEnum.NODE: return '/node/'
    case ObjectTypeEnum.JOINT: return '/joint/'
    case ObjectTypeEnum.WORD:
    case ObjectTypeEnum.SENTENCE:
    case ObjectTypeEnum.CHAR: return '/sphere/'
    case ObjectTypeEnum.VIDEO:
    case ObjectTypeEnum.IMAGE:
    case ObjectTypeEnum.BOOK: return '/content/'
    case ObjectTypeEnum.BLOCK: return '/block/'
    case ObjectTypeEnum.USER: return '/user/'
    default: return '/'
  }
}
