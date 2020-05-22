export const wsSchemaNode = {
  title: 'wsSchemaNode',
  version: 0,
  description: 'wsSchemaNode',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    changesFromClient: {
      type: 'boolean',
      default: false
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
    revisionServer: {
      type: 'integer',
      default: 0
    },
    revisionClient: {
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
    }
  },
  required: ['id', 'wsItemType', 'revisionServer', 'revisionClient', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaContent = {
  title: 'wsSchemaContent',
  version: 0,
  description: 'wsSchemaContent',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    changesFromClient: {
      type: 'boolean',
      default: false
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
    revisionServer: {
      type: 'integer',
      default: 0
    },
    revisionClient: {
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
    spheres: {
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
    operation: {
      type: 'object'
    }
  },
  required: ['id', 'wsItemType', 'revisionServer', 'revisionClient', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaChain = {
  title: 'wsSchemaChain',
  version: 0,
  description: 'wsSchemaChain',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    changesFromClient: {
      type: 'boolean',
      default: false
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
    revisionServer: {
      type: 'integer',
      default: 0
    },
    revisionClient: {
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
    }
  },
  required: ['id', 'wsItemType', 'revisionServer', 'revisionClient', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaSphere = {
  title: 'wsSchemaSphere',
  version: 0,
  description: 'wsSchemaSphere',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: {
      type: 'string',
      primary: true
    },
    changesFromClient: {
      type: 'boolean',
      default: false
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
    revisionServer: {
      type: 'integer',
      default: 0
    },
    revisionClient: {
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
    }
  },
  required: ['id', 'wsItemType', 'revisionServer', 'revisionClient', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}

export const wsSchemaMetaCollections = {
  title: 'wsSchemaMetaCollections',
  version: 0,
  description: 'wsSchemaMetaCollections',
  type: 'object',
  additionalProperties: true,
    properties: {
      rxCollectionEnum: {
        type: 'string',
        primary: true
      },
      fetchedAt: {
        type: 'integer'
      }
    },
  required: ['rxCollectionEnum', 'fetchedAt']
}

export const wsSchemaMetaUnsaved = {
  title: 'wsSchemaMetaUnsaved',
  version: 0,
  description: 'wsSchemaMetaUnsaved',
  type: 'object',
  additionalProperties: true,
  properties: {
    id: {
      type: 'string',
      primary: true
    }
  },
  required: ['id']
}
