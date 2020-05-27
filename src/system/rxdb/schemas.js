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
    changedBy: {
      type: 'string',
      default: 'USER'
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
    },
    stage: {
      type: 'string'
    }
  },
  required: ['id', 'wsItemType', 'rev', 'changedBy', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaContent = {
  title: 'wsSchemaContent',
  version: 0,
  description: 'wsSchemaContent',
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
    changedBy: {
      type: 'string',
      default: 'USER'
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
    contentType: {
      type: 'string'
    },
    operation: {
      type: 'object'
    }
  },
  required: ['id', 'wsItemType', 'rev', 'changedBy', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaChain = {
  title: 'wsSchemaChain',
  version: 0,
  description: 'wsSchemaChain',
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
    changedBy: {
      type: 'string',
      default: 'USER'
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
  required: ['id', 'wsItemType', 'rev', 'changedBy', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}
export const wsSchemaSphere = {
  title: 'wsSchemaSphere',
  version: 0,
  description: 'wsSchemaSphere',
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
    changedBy: {
      type: 'string',
      default: 'USER'
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
    color: {
      type: 'string'
    }
  },
  required: ['id', 'wsItemType', 'rev', 'changedBy', 'createdAt', 'updatedAt'],
  indexes: ['oid', 'name', 'createdAt', 'updatedAt']
}

export const wsSchemaMeta = {
  title: 'wsSchemaMeta',
  version: 0,
  description: 'wsSchemaMeta',
  type: 'object',
    properties: {
      key: {
        type: 'string',
        primary: true
      },
      value: {
        type: 'string'
      }
    },
  required: ['key', 'value']
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
