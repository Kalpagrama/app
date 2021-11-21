<template lang="pug">
q-btn-dropdown(flat icon="add", :content-style=`{borderRadius: '10px', background: 'rgb(40,40,40)'}`)
  div(
    :style=`{ borderRadius: '10px', color: 'white', border: '2px solid rgb(76,175,79)', paddingLeft: '10px'}`
  ).row.full-width
    q-input(v-model="newCollectionName", borderless dark :placeholder="$t('New collection')" @keyup.enter="createCollection").col.full-width
    q-btn(round flat v-close-popup :color="newCollectionName ? 'green' : null", icon="add", :disable="!newCollectionName" @click="createCollection")
  div(:style=`{height: Math.min(modelValue.collections.length*40, 300)+'px'}`).scroll
    div(v-for="(c,ci) in modelValue.collections" :key="c.id").row.full-width
      q-btn(
        round flat no-caps v-close-popup align="left"
        :color="modelValue.collectionId==c.id && highlightSelected? 'green' : 'grey-8'"
        :label="c.name"
        @click="modelValue.collectionId=c.id, $emit('collection-select', c.id)"
        ).col.full-width.q-pl-sm
      q-btn(v-if="showDeleteButton" round flat no-caps :icon="c.id=='all' ? null : 'clear'" color= "red" @click="removeCollection(c.id)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import {assert} from 'src/system/common/utils'

export default {
  name: 'AddCollectionBtn',
  props: {
    modelValue: {type: Object, required: true},
    highlightSelected: {type: Boolean, default: true},
    showDeleteButton: {type: Boolean, default: true},
    showAllCollection: {type: Boolean, default: true},
  },
  data () {
    return {
      collectionsRes: null,
      newCollectionName: ''
    }
  },
  watch: {
    'collectionsRes.items': {
      deep: true,
      handler (to, from) {
        if (to) {
          const collectionAll = {
            id: 'all',
            name: this.$t('All')
          }
          this.modelValue.collections = (this.showAllCollection ? [collectionAll, ...this.collectionsRes.items] : this.collectionsRes.items)
          // this.modelValue.collections.splice(0, this.modelValue.collections.length, ...[collectionAll, ...this.collectionsRes.items])
          // this.$set(this.modelValue, 'collections', [collectionAll, ...this.collectionsRes.items])
        }
      }
    }
  },
  computed: {
    queryCollections () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION
        },
        sort: [{ createdAt: 'desc' }]
      }
      return res
    },
  },
  methods: {
    async createCollection () {
      assert(this.newCollectionName)
      let collectionInput = {
        name: this.newCollectionName
      }
      let newCollection = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
      this.modelValue.collectionId = newCollection.id
      this.newCollectionName = ''
      this.$emit('collection-select', this.modelValue.collectionId)
    },
    async removeCollection (id) {
      await this.$rxdb.remove(id)
      if (id === this.modelValue.collectionId) this.modelValue.collectionId = 'all'
    },
    update(key, modelValue) {
      this.$emit('update:modelValue', { ...this.modelValue, [key]: modelValue })
    },
  },
  async mounted () {
    this.$log('mounted')
    this.collectionsRes = await this.$rxdb.find(this.queryCollections)
    // this.$set(this.modelValue, 'collectionId', this.collectionsRes.items.length ? this.collectionsRes.items[0].id : 'all')
    this.modelValue.collectionId = this.modelValue.collectionId || 'all'
  }
}
</script>
