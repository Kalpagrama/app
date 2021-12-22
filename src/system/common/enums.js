const BookUploadFormatEnum = Object.freeze({
   EPUB: 'epub'
})
const VideoUploadFormatEnum = Object.freeze({
   SD144: '144p',
   SD240: '240p',
   SD360: '360p',
   SD480: '480p',
   HD720: '720p',
   HD1080: '1080p'
})
const ImageUploadFormatEnum = Object.freeze({
   W50: '50',
   W600: '600',
   W1024: '1024',
   W1920: '1920',
   GIF: 'gif',
   SNIPPET: 'snippet',
   VK: 'vkSnippet',
   TW: 'twSnippet',
   FB: 'fbSnippet',
   TG: 'tgSnippet'
})
const UploadFormatEnum = Object.freeze({
   DEFAULT: 'default',
   ...BookUploadFormatEnum,
   ...VideoUploadFormatEnum,
   ...ImageUploadFormatEnum

})

const ErrorCodeEnum = Object.freeze({
   UNKNOWN_ERROR: 'UNKNOWN_ERROR',
   SERVER_INTERNAL_ERROR: 'SERVER_INTERNAL_ERROR',
   NOT_FOUND_USER: 'NOT_FOUND_USER',
   BAD_PASSWORD: 'BAD_PASSWORD',
   BAD_CODE: 'BAD_CODE',
   BAD_SESSION: 'BAD_SESSION',
   BAD_DATA: 'BAD_DATA',
   BAD_LOGIN: 'BAD_LOGIN',
   BAD_INVITE: 'BAD_INVITE',
   NO_INVITE: 'NO_INVITE',
   NOT_FOUND_SESS: 'NOT_FOUND_SESS',
   NOT_FOUND_EMAIL: 'NOT_FOUND_EMAIL',
   NOT_FOUND: 'NOT_FOUND',
   DUPLICATE_FOUND: 'DUPLICATE_FOUND',
   USER_NOT_AUTH: 'USER_NOT_AUTH',
   USER_NOT_CONFIRMED: 'USER_NOT_CONFIRMED',
   USER_INSUFFICIENT_PRIVILEGES: 'USER_INSUFFICIENT_PRIVILEGES',
   PASSWORD_INCORRECT: 'PASSWORD_INCORRECT',
   UNCONFIRMED_LOGIN_DISABLED: 'UNCONFIRMED_LOGIN_DISABLED',
   TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
   VERSION_CONFLICT: 'VERSION_CONFLICT',
   LIMIT_EXCEEDED: 'LIMIT_EXCEEDED'
})
// данная логика продублирована в БД. Синхронизировать при изменении!
const ContentTypeEnum = Object.freeze({
   CHAR: 'CHAR',
   WORD: 'WORD',
   SENTENCE: 'SENTENCE',
   AUDIO: 'AUDIO',
   IMAGE: 'IMAGE',
   VIDEO: 'VIDEO',
   BOOK: 'BOOK',
   FRAME: 'FRAME',
   EMOJI: 'EMOJI'
})
const ObjectTypeEnum = Object.freeze({
   SPHERE: 'SPHERE',
   NODE: 'NODE',
   JOINT: 'JOINT',
   BLOCK: 'BLOCK',
   RESERVED_BASE_TYPE_1: 'RESERVED_BASE_TYPE_1',
   RESERVED_BASE_TYPE_2: 'RESERVED_BASE_TYPE_2',
   RESERVED_BASE_TYPE_3: 'RESERVED_BASE_TYPE_3',
   RESERVED_BASE_TYPE_4: 'RESERVED_BASE_TYPE_4',

   WS_ITEM: 'WS_ITEM',
   RESERVED_SERVICE_TYPE_1: 'RESERVED_SERVICE_TYPE_1',
   RESERVED_SERVICE_TYPE_2: 'RESERVED_SERVICE_TYPE_2',
   RESERVED_SERVICE_TYPE_3: 'RESERVED_SERVICE_TYPE_3',
   RESERVED_SERVICE_TYPE_4: 'RESERVED_SERVICE_TYPE_4',

   USER: 'USER',
   COMPOSITION: 'COMPOSITION',
   RESERVED_CONTENT_AGG_TYPE_1: 'RESERVED_CONTENT_AGG_TYPE_1',
   RESERVED_CONTENT_AGG_TYPE_2: 'RESERVED_CONTENT_AGG_TYPE_2',
   RESERVED_CONTENT_AGG_TYPE_3: 'RESERVED_CONTENT_AGG_TYPE_3',
   RESERVED_CONTENT_AGG_TYPE_4: 'RESERVED_CONTENT_AGG_TYPE_4',

   ...ContentTypeEnum
})
const ObjectTypeEnumStringToInt = Object.freeze({
   SPHERE: 0,
   NODE: 1,
   JOINT: 2,
   BLOCK: 3,
   RESERVED_BASE_TYPE_1: 4,
   RESERVED_BASE_TYPE_2: 5,
   RESERVED_BASE_TYPE_3: 6,
   RESERVED_BASE_TYPE_4: 7,

   WS_ITEM: 8,
   RESERVED_SERVICE_TYPE_1: 9,
   RESERVED_SERVICE_TYPE_2: 10,
   RESERVED_SERVICE_TYPE_3: 11,
   RESERVED_SERVICE_TYPE_4: 12,

   USER: 13,
   COMPOSITION: 14,
   RESERVED_CONTENT_AGG_TYPE_1: 15,
   RESERVED_CONTENT_AGG_TYPE_2: 16,
   RESERVED_CONTENT_AGG_TYPE_3: 17,
   RESERVED_CONTENT_AGG_TYPE_4: 18,

   CHAR: 19,
   WORD: 20,
   SENTENCE: 21,
   AUDIO: 22,
   IMAGE: 23,
   VIDEO: 24,
   BOOK: 25,
   FRAME: 26,
   EMOJI: 27
})
const ObjectTypeEnumIntToString = Object.freeze({
   0: 'SPHERE',
   1: 'NODE',
   2: 'JOINT',
   3: 'BLOCK',
   4: 'RESERVED_BASE_TYPE_1',
   5: 'RESERVED_BASE_TYPE_2',
   6: 'RESERVED_BASE_TYPE_3',
   7: 'RESERVED_BASE_TYPE_4',

   8: 'WS_ITEM',
   9: 'RESERVED_SERVICE_TYPE_1',
   10: 'RESERVED_SERVICE_TYPE_2',
   11: 'RESERVED_SERVICE_TYPE_3',
   12: 'RESERVED_SERVICE_TYPE_4',

   13: 'USER',
   14: 'COMPOSITION',
   15: 'RESERVED_CONTENT_AGG_TYPE_1',
   16: 'RESERVED_CONTENT_AGG_TYPE_2',
   17: 'RESERVED_CONTENT_AGG_TYPE_3',
   18: 'RESERVED_CONTENT_AGG_TYPE_4',

   19: 'CHAR',
   20: 'WORD',
   21: 'SENTENCE',
   22: 'AUDIO',
   23: 'IMAGE',
   24: 'VIDEO',
   25: 'BOOK',
   26: 'FRAME',
   27: 'FRAME'
})
const LangEnum = Object.freeze({ RUS: 'RUS', ENG: 'ENG' })
const LangEnumStringToInt = Object.freeze({ RUS: 0, ENG: 1 })
const LangEnumIntToString = Object.freeze({ 0: 'RUS', 1: 'ENG' })

const SortStrategyEnum = Object.freeze({
   HOT: 'HOT',
   ESSENTIALLY: 'ESSENTIALLY',
   AGE: 'AGE',
   RELATING_TO_TIME: 'RELATING_TO_TIME',
   ACTIVITY: 'ACTIVITY'
})

const LoginTypeEnum = Object.freeze({
   UNREGISTERED: 'UNREGISTERED',
   PHONE: 'PHONE',
   EMAIL: 'EMAIL',
   USERNAME: 'USERNAME',
   OAUTH_VK: 'OAUTH_VK',
   OAUTH_GOOGLE: 'OAUTH_GOOGLE',
   OAUTH_FACEBOOK: 'OAUTH_FACEBOOK',
   OAUTH_TWITTER: 'OAUTH_TWITTER',
   OAUTH_YANDEX: 'OAUTH_YANDEX',
   OAUTH_MAILRU: 'OAUTH_MAILRU',
   OAUTH_APPLE: 'OAUTH_APPLE'
})

const VertexTypeEnum = Object.freeze({
   ESSENCE: 'ESSENCE', // элементы связаны через общую суть (поле name)
   ASSOCIATIVE: 'ASSOCIATIVE', // через общую неуказанную суть
   CAUSE: 'CAUSE',
   EFFECT: 'EFFECT',
   PROBLEM: 'PROBLEM',
   SOLUTION: 'SOLUTION',
   FROM: 'FROM',
   TO: 'TO',
   FAKE: 'FAKE',
   DISPROOF: 'DISPROOF',
   FACT: 'FACT',
   PROOF: 'PROOF',
   QUESTION: 'QUESTION',
   ANSWER: 'ANSWER'
})

const GenderEnum = Object.freeze({ MALE: 'MALE', FEMALE: 'FEMALE' })

const OrderEnum = Object.freeze({ ASC: 0, DESC: 1 })

const DirectionEnum = Object.freeze({ FORWARD: 'FORWARD', BACKWARD: 'BACKWARD' })

const UserRoleEnum = Object.freeze({
   ADMIN: 'ADMIN',
   MODERATOR: 'MODERATOR',
   MEMBER: 'MEMBER',
   UNCONFIRMED: 'UNCONFIRMED', // неподтвержденная запись (нужно будет подтвердить позже)
   GUEST: 'GUEST' // вход без логина
})
const UserCredentials = Object.freeze({
   UPLOAD_FROM_DEVICE: 'UPLOAD_FROM_DEVICE',
   CREATE_BOOK_CUT: 'CREATE_BOOK_CUT' // озвучить кусок книги
})

const UploadFileTypeEnum = Object.freeze({
   USER_PHOTO: 'photo', // аватарка
   USER_COVER: 'cover', // обложка на личной сфере
   CONTENT: 'content', //
   CONTENT_STRIP: 'strip', // колбаски для таймлайна
   THUMB: 'thumb',
   THUMB_SSR: 'thumb_ssr', // как будет выглядеть элемент после рендеринга на фронте (нужно для шаринга сниппетов)
   CUT: 'cut',
   COMPOSITION: 'composition',
   WS_THUMB: 'ws_thumb',
   WS_CONTENT: 'ws_content'
})

const WsItemTypeEnum = Object.freeze({
   WS_NODE: 'WS_NODE',
   WS_JOINT: 'WS_JOINT',
   WS_BLOCK: 'WS_BLOCK',
   WS_CONTENT: 'WS_CONTENT',
   WS_SPHERE: 'WS_SPHERE',
   WS_BOOKMARK: 'WS_BOOKMARK',
   WS_PUBLISHED: 'WS_PUBLISHED', // ссылки на мои опубликванные ядра джойнты и блоки
   WS_HISTORY: 'WS_HISTORY',
})

const FindCollectionEnum = Object.freeze({
   WS: 'WS',
   OBJECTS: 'OBJECTS',
   EVENTS: 'EVENTS',
   SUBSCRIPTIONS: 'SUBSCRIPTIONS',
   SUBSCRIBERS: 'SUBSCRIBERS',
   CUTS: 'CUTS', // куски выкачанного контента (либо озвученные куски книг)
   COMMENTS: 'COMMENTS' // комменты на ядрах и сферах
})

const StatKeyEnum = Object.freeze({
   VIEWED_TIME: 'VIEWED_TIME',
   BOOKMARKED: 'BOOKMARKED',
   SHARED: 'SHARED',
   REMADE: 'REMADE',
   COMPOSITION_CREATED: 'COMPOSITION_CREATED',
   ESSENCE_CREATED: 'ESSENCE_CREATED'
})

export {
   ErrorCodeEnum,
   LangEnum,
   SortStrategyEnum,
   LoginTypeEnum,
   // RelationTypeEnum,
   VertexTypeEnum,
   ContentTypeEnum,
   ObjectTypeEnum,
   GenderEnum,
   OrderEnum,
   DirectionEnum,
   UserRoleEnum,
   UserCredentials,
   UploadFileTypeEnum,
   WsItemTypeEnum,
   FindCollectionEnum,
   StatKeyEnum,
   BookUploadFormatEnum,
   VideoUploadFormatEnum,
   ImageUploadFormatEnum,
   UploadFormatEnum,
   ObjectTypeEnumStringToInt,
   ObjectTypeEnumIntToString,
   LangEnumStringToInt,
   LangEnumIntToString
}
