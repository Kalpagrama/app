<template lang="pug">
.column.fit.bg-white
  .col
    content-add(ref="addOne")
  div(style=`height: 60px`).row.items-between
    .row.full-width.justify-center
      q-input(v-model="node.name" input-style=`fontSize: 18px` :input-class="['text-center']"
        placeholder="В чем суть?").full-width
  .col
    content-add(ref="addTwo")
  div(style=`height: 60px`).row.full-width.items-center.justify-between.q-px-md
    //- q-input(v-model="hashTags" placeholder="Добавь тэги").full-width
    q-select(
      v-model="hashTags" use-input use-chips multiple
      :label="hashTags.length > 0 ? 'Тэги' : 'Добавь тэги'"
      :input-debounce="1000" :option-label="(item) => '#' + item.name"
      @new-value="hashTagCreate" @filter="hashTagFilter"
      :options="hashTagsOptions").full-width
      template(v-slot:no-option)
        q-item
          q-item-section(class="text-grey") Нечего!
    //- q-btn(v-show="node.hashTags.length === 0" label="Добавь тэги" no-caps outline color="primary")
    //- div(v-show="node.hashTags.length > 0"
    //-   style=`overflow: hidden; height: 60px`).row.no-wrap.full-width.items-center.justify-center
    //-   div(v-for="(t, ti) in node.hashTags" :key="t" style=`minWidth: 100px; borderRadius: 18px`
    //-     ).row.full-width.items-center.q-pa-sm.bg-grey-3.justify-between
    //-     span #
    //-     span {{ t }}
    //-     q-btn(dense round icon="clear" @click="tagDelete(t, ti)" flat size="xs")
</template>

<script>
import contentAdd from './content_add'
export default {
  name: 'pageAppNodeCreate',
  components: {contentAdd},
  data () {
    return {
      hashTags: [],
      hashTagsOptions: [],
      node: {
        name: '',
        fragments: [],
        hashTags: []
      }
    }
  },
  methods: {
    hashTagCreate (val, done) {
      this.$log('hashTagCreate', val)
      if (val.length > 0) {
        this.hashTagsOptions.push({name: val})
        done(val, 'toggle')
      }
      // done({name: val}, 'add-unique')
    },
    hashTagFilter (val, update, abort) {
      this.$log('hashTagFilter')
      update(async () => {
        if (val === '' || val.length < 2) {
          // this.filterOptions = stringOptions
        } else {
          const needle = val.toLowerCase()
          let tags = await this.$apollo.query({
            query: gql`
              query autocomplete ($searchStr: String!) {
                autocomplete(objectTypes: WORD, searchStr: $searchStr) {
                  name
                  oid
                }
              },
            `,
            variables: {
              searchStr: needle
            }
          })
          this.$log('tags', tags)
          this.hashTagsOptions = tags.data.autocomplete
        }
      })
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      let u1 = await this.$refs.addOne.photoUpload()
      let u2 = await this.$refs.addTwo.photoUpload()
      let res = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeCreate ($node: NodeInput!) {
            # impersonate(login: "4321ip@mail.ru")
            nodeCreate (node: $node) {
              oid
              type
              name
            }
          }
        `,
        variables: {
          node: {
            name: this.core.name,
            fragments: [{oid: u1.oid, relativePoints: [], relativeScale: 1000}, {oid: u2.oid, relativePoints: [], relativeScale: 1000}],
            hashTags: []
          }
        }
      })
      this.$log('nodeCreate', res)
      this.$log('nodeCreate done')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
