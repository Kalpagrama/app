<template lang="pug">
.column.fit.bg-white
  //- div(style=`height: 50px`).row.full-width.items-center.q-px-md
  //-   span header
  //-   q-btn(icon="settings" color="primary")
  .col
    content-add(ref="addOne")
  div(style=`height: 130px`).row.items-between
    //- core name
    .row.full-width.justify-center
      q-input(v-model="core.name" input-style=`fontSize: 18px` :input-class="['text-center']"
        placeholder="Заголовок").full-width
    //- core tags
    //- .row.full-width
    //-   q-btn(v-show="core.tags.length === 0" label="add tags" no-caps outline color="primary")
    //-   div(v-show="core.tags.length > 0"
    //-     style=`overflow: hidden; height: 60px`).row.no-wrap.full-width.items-center.justify-center
    //-     div(v-for="(t, ti) in core.tags" :key="t" style=`minWidth: 100px; borderRadius: 18px`
    //-       ).row.full-width.items-center.q-pa-sm.bg-grey-3.justify-between
    //-       span #
    //-       span {{ t }}
    //-       q-btn(dense round icon="clear" @click="tagDelete(t, ti)" flat size="xs")
  .col
    content-add(ref="addTwo")
  div(style=`height: 50px`).row.full-width.items-center.justify-between.q-px-md
    q-btn(no-caps icon="settings" flat round dense color="grey" @click="settingsClick")
    q-btn(no-caps label="Создать" color="primary" dense @click="nodeCreate")
</template>

<script>
import contentAdd from './content_add'
export default {
  name: 'pageAppNodeCreate',
  components: {contentAdd},
  data () {
    return {
      core: {
        name: '',
        tags: [
          'сталин',
          'смерть',
          'мощь',
          'усы'
        ]
      }
    }
  },
  computed: {
  },
  methods: {
    tagDelete (t, ti) {
      this.$log('tagDelete', t, ti)
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
    },
    settingsClick () {
      this.$log('settingsClick')
      this.$q.bottomSheet({
        message: 'Настройки',
        actions: [
          {id: 'description', label: 'Добавить описание'}
        ]
      })
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
