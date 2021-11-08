import {assert} from './utils'
import { t } from 'src/boot/i18n'
import { ObjectTypeEnum, WsItemTypeEnum } from 'src/system/common/enums'

export function objectTypeName(object) {
  assert(object && (object.type || object.wsItemType))
  switch (object.type || object.wsItemType) {
    case WsItemTypeEnum.WS_NODE:
    case ObjectTypeEnum.NODE: return t('Node')
    case WsItemTypeEnum.WS_JOINT:
    case ObjectTypeEnum.JOINT: return t('Joint')
    case WsItemTypeEnum.WS_SPHERE:
    case ObjectTypeEnum.WORD:
    case ObjectTypeEnum.SENTENCE:
    case ObjectTypeEnum.CHAR: return t('Sphere')
    case WsItemTypeEnum.WS_CONTENT: return t('Content')
    case ObjectTypeEnum.VIDEO: return t('Video')
    case ObjectTypeEnum.IMAGE: return t('Image')
    case ObjectTypeEnum.BOOK: return t('Book')
    case WsItemTypeEnum.WS_BLOCK:
    case ObjectTypeEnum.BLOCK: return t('Block')
    case ObjectTypeEnum.USER: return t('User')
    default: return t('unknown')
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
