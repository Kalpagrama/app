export const schemaKeyValue = {
  title: 'schemaKeyValue',
  version: 0,
  description: 'schemaKeyValue',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    valueString: {
      type: 'string'
    }
  },
  required: ['id', 'valueString']
}

export const wsSchemaItem = {
  title: 'wsSchemaItem',
  version: 1,
  description: 'wsSchemaItem',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    oid: {
      type: 'string' // присваивается после публикации
    },
    type: {
      type: 'string'
    },
    wsItemType: {
      type: 'string'
    },
    name: {
      type: 'string',
      default: '!_unnamed_!'
    },
    thumbUrl: {
      type: 'string'
    },
    description: {
      type: 'string',
      default: ''
    },
    rev: {
      type: 'integer',
      default: 0
    },
    createdAt: {
      type: 'integer',
      default: 0
    },
    updatedAt: {
      type: 'integer',
      default: 0
    },
    deletedAt: {
      type: 'integer'
    },
    // ---- node ----
    contentOids: {
      type: 'array',
      maxItems: 88,
      items: {
        type: 'string'
      }
    },
    items: {
      type: 'array',
      maxItems: 88,
      uniqueItems: false,
      // items: {
      //   type: ['object', 'string', 'null']
      // }
    },
    spheres: {
      type: 'array',
      maxItems: 888,
      uniqueItems: false,
      items: {
        type: ['object', 'string']
      }
    },
    // feeds: {
    //   type: 'array',
    //   items: {
    //     type: ['string', 'object']
    //   }
    // },
    category: {
      type: 'string'
    },
    layout: {
      type: 'string'
    },
    // ---- content ----
    layers: {
      type: 'array',
      maxItems: 888,
      uniqueItems: false,
      items: {
        type: 'object'
      }
    },
    contentOid: {
      type: 'string'
    },
    contentType: {
      type: 'string'
    },
    operation: {
      type: 'object'
    },
    // ---- collection ----
    color: {
      type: 'string'
    },
    bookmarks: { // список id букмарков в этой коллекции
      type: 'array',
      items: {
        type: 'string'
      }
    },
    // ---- bookmark ----
    collections: { // список id коллекций в которые попал букмарк
      type: 'array',
      items: {
        type: 'string'
      }
    },
    // ------ system -----
    ignoreChanges: {
      type: 'boolean',
      default: false
    },
    synchronized: { // изменения применены на сервере (отправлять изменения этого элемента на надо)
      type: 'boolean',
      default: true
    }
  },
  required: ['id', 'wsItemType', 'rev', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'wsItemType', 'name', 'createdAt', 'updatedAt']
}

export const wsSchemaLocalChanges = {
  title: 'wsSchemaLocalChanges',
  version: 0,
  description: 'wsSchemaLocalChanges',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    operation: {
      type: 'string'
    },
    rev: {
      type: 'integer'
    }
  },
  required: ['id', 'operation', 'rev']
}

export const cacheSchema = {
  title: 'cacheSchema',
  version: 0,
  description: 'cacheSchema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    props: {
      type: 'object',
      properties: {
        notEvict: {
          type: 'boolean',
          default: false
        },
        oid: {
          type: 'string'
        },
        rxCollectionEnum: {
          type: 'string'
        },
        mangoQuery: { // актуально для списков см Lists::find
          type: 'object'
        }
      }
    },
    cached: {
      type: 'object'
    }
  },
  required: ['id', 'props', 'cached'],
  indexes: ['props.oid', 'props.rxCollectionEnum']
}
