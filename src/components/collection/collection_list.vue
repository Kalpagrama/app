<template lang="pug">
  .row.justify-end
    q-btn(flat icon="add" :label="$t('Add collection')" no-caps color="green" :style=`{marginRight: '-10px'}`)
     q-popup-proxy(:breakpoint="1024" transition-show="flip-up" transition-hide="flip-down" :content-style=`{borderRadius: '10px', background: 'rgba(40,40,40,0.7)'}`)
      div(
        :style=`{ borderRadius: '10px', color: 'white', border: '2px solid rgb(76,175,79)', paddingLeft: '10px', background: 'rgba(40,40,40)'}`
      ).row.full-width
        q-input(v-model="newCollectionName", autofocus, borderless dark :placeholder="$t('New collection')" @keyup.enter="createCollection").col.full-width
        q-btn(v-close-popup round flat :color="newCollectionName ? 'green' : null", icon="add", :disable="!newCollectionName" @click="createCollection")
    div(:style=`{height: Math.min(value.collections.length*40, 180)+'px'}`).scroll.full-width.row
      //div(v-for="(c,ci) in value.collections" :key="c.id").col.full-width.br.wrap
      q-chip(
        v-for="(c,ci) in value.collections" :key="c.id"
        no-caps clickable text-color="white" outline
        :color="value.selectedCollectionIds.includes(c.id) && highlightSelected? 'green' : 'grey-8'"
        @click="addRemoveCollection(c)"
      ).q-pl-sm
        div(:style=`{maxWidth: $q.screen.width > 768 ? '500px' : '250px', fontSize: '12px'}`).ellipsis {{ c.name }}
        q-btn(v-if="showDeleteButton" round flat no-caps :icon="c.id=='all' ? null : 'clear'" color= "red" @click="removeCollection(c.id)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import {assert} from 'src/system/common/utils'

export default {
  name: 'collectionList',
  props: {
    value: {type: Object, required: true},
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
      handler (to, from) {
        if (to) {
          const collectionAll = {
            id: 'all',
            name: this.$t('All')
          }
          this.value.collections = (this.showAllCollection ? [collectionAll, ...this.collectionsRes.items] : this.collectionsRes.items)
          // this.value.collections.splice(0, this.value.collections.length, ...[collectionAll, ...this.collectionsRes.items])
          // this.$set(this.value, 'collections', [collectionAll, ...this.collectionsRes.items])
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
    addRemoveCollection(c) {
      let indx = this.value.selectedCollectionIds.findIndex(id => c.id === id)
      if (indx >= 0) this.value.selectedCollectionIds.splice(indx, 1)
      else this.value.selectedCollectionIds.push(c.id)
    },
    async createCollection () {
      assert(this.newCollectionName)
      let collectionInput = {
        name: this.newCollectionName
      }
      let newCollection = await this.$rxdb.set(RxCollectionEnum.WS_COLLECTION, collectionInput)
      this.value.collectionId = newCollection.id
      this.newCollectionName = ''
      this.$emit('collection-select', this.value.collectionId)
    },
    async removeCollection (id) {
      await this.$rxdb.remove(id)
      if (id === this.value.collectionId) this.value.collectionId = 'all'
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value })
    },
  },
  async mounted () {
    this.$log('mounted')
    this.collectionsRes = await this.$rxdb.find(this.queryCollections)
    // this.$set(this.value, 'collectionId', this.collectionsRes.items.length ? this.collectionsRes.items[0].id : 'all')
    this.value.collectionId = this.value.collectionId || 'all'
  }
}
</script>
