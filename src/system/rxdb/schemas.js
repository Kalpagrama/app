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
  version: 0,
  description: 'wsSchemaItem',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    oid: {
      type: 'string'
    },
    wsItemType: {
      type: 'string'
    },
    name: {
      type: 'string',
      default: '!_unnamed_!'
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
    items: {
      type: 'array',
      maxItems: 88,
      uniqueItems: false,
      items: {
        type: 'object'
      }
    },
    spheres: {
      type: 'array',
      maxItems: 888,
      uniqueItems: false,
      items: {
        type: 'object'
      }
    },
    category: {
      type: 'string'
    },
    layout: {
      type: 'string'
    },
    stage: {
      type: 'string'
    },
    // ---- content ----
    thumbOid: {
      type: 'string'
    },
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
    // ---- chain ----
    // todo
    // ---- sphere ----
    color: {
      type: 'string'
    }
  },
  required: ['id', 'wsItemType', 'rev', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'wsItemType', 'name', 'createdAt', 'updatedAt', 'stage']
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
    }
  },
  required: ['id', 'operation']
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
