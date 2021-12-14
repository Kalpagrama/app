<style lang="sass">
.menu-item
  cursor: pointer

  &:hover
    background: rgb(40, 40, 40)

.create-item
  color: #424242

  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
.column.full-width
  //- header
  div(
    :style=`{borderRadius: '10px',}`
  ).row.full-width.items-center.content-center
    div(
      @click="$go('/about')"
      :style=`{borderRadius: '10px',}`
    ).row.full-width
      div(
        :style=`{zIndex: 100, height: '60px', width: '60px', cursor: 'pointer !important'}`
      ).row.items-center.content-center.justify-center.cursor-pointer
        kalpa-logo(:width="40" :height="40" :style=`{pointEvents: 'none'}`)
      div(v-if="!mini").col
        div(
        ).row.fit.items-center.content-center.cursor-pointer
          span(:style=`{fontSize: '18px'}`).text-grey-5.text-bold {{$t('Kalpagrama')}}
          .row.full-width
            small.text-grey-4 {{$t('Connect the dots')}}
  //- body
  div(:style=`{overflowX: 'hidden'}`).col.full-width
    div(
      :style=`{
      borderRadius: '10px', overflow: 'hidden'
    }`
    ).column.full-width.q-pt-sm
      //- pages
      div(
        v-for="(p,pi) in pages" :key="p.id"
        @click="p.action"
        :class=`{
          'b-40': $route.path.split('/')[1] === p.id
        }`
        :style=`{
          height: $q.screen.width > 600 ? '60px' : '60px',
          borderRadius: '10px', overflow: 'hidden',
        }`
      ).row.full-width.items-center.menu-item.q-mb-sm
        div(:style=`{width: '60px'}`).row.full-height.items-center.content-center.justify-center
          q-icon(size="30px" :name="p.icon" :color="p.color || 'grey-5'")
        span(
          v-if="!mini"
          :style=`{fontSize: '18px'}`).text-bold.text-grey-5 {{ p.name }}
      //- user
      div(
        v-if="!$store.getters.isGuest"
        @click="$eventBus.$emit('btn-user-clicked'), $go('/user/'+$store.getters.currentUser.oid)"
        :class=`{
          'b-60': $route.path.split('/')[1] === 'user' && $route.params.oid === $store.getters.currentUser.oid
        }`
        :style=`{
          height: '60px',
          borderRadius: '10px',
          overflow: 'hidden',
        }`
      ).row.full-width.items-center.content-center.menu-item.cursor-pointer
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          user-avatar(:url="$store.getters.currentUser.thumbUrl" :width="40" :height="40")
        div(v-if="!mini").col.full-height
          .row.fit.items-center.content-center
            span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-grey-5.text-bold {{$store.getters.currentUser.name}}
            //- small.text-grey-4.full-width {{ '@'+$store.getters.currentUser.username }}
      //- login for GUEST
      div(
        v-if="$store.getters.isGuest"
        @click="$store.commit('ui/stateSet', ['authGuard', {message: ''}])"
        :style=`{
          height: '60px',
          borderRadius: '10px',
          overflow: 'hidden'
        }`
      ).row.full-width.items-cener.content-center.menu-item
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          div(
            :style=`{
              height: '40px', width: '40px',
              minWidth: '40px', minHeight: '40px',
              maxWidth: '40px', maxHeight: '40px',
              borderRadius: '50%',
            }`).row.items-center.content-center.justify-center.b-50
            q-icon(name="person" size="26px" color="grey-5")
        div(v-if="!mini").col.full-height
          .row.fit.items-center.content-center
            span(:style=`{fontSize: '18px'}`).text-grey-5.text-bold {{$t('Login')}}
      //- Create new
      //div(
      //  v-if="!$store.getters.isGuest"
      //  @click="addItemMenuShow = true"
      //  :style=`{
      //      height: '60px',
      //      borderRadius: '10px',
      //      overflow: 'hidden',
      //    }`
      //).row.full-width.menu-item.cursor-pointer
      //  q-dialog(
      //    v-model="addItemMenuShow"
      //    position="standard"
      //    :maximized="false"
      //  )
      //    div(:style=`{background: 'rgb(35,35,35)',borderRadius: '10px'}`).row.full-width.q-pa-md.justify-center
      //      q-btn(
      //        outline color="grey-8"
      //        size="xl"
      //        align="center"
      //        :label="$t('Essence core')"
      //        icon='adjust'
      //        round flat no-caps
      //        @click="itemEditorShow = true, addItemMenuShow = false"
      //      ).row.full-width.create-item.q-pa-sm
      //        //q-dialog(
      //        //  v-model="itemEditorShow"
      //        //  :maximized="false"
      //        //  position="standard")
      //        //  item-editor(
      //        //    :item="newNode"
      //        //    :publish="true"
      //        //    @close="itemEditorShow=false")
      //      q-btn(
      //        outline color="grey-8"
      //        align="center"
      //        size="xl"
      //        :to="'/workspace/edit?mode=block'"
      //        :label="$t('Essence block')"
      //        icon='dashboard_customize'
      //        round flat no-caps
      //      ).row.full-width.create-item.q-pa-sm
      //  div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      //    q-icon(size="30px" name='add_circle_outline' color='grey-5')
      //  div(v-if="!mini").col.full-height
      //    .row.fit.items-center.content-center
      //      span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-grey-5.text-bold {{$t('Create')}}
            //- small.text-grey-4.full-width {{ '@'+$store.getters.currentUser.username }}
      //How it work?
      div(
        @click="$go('/about')"
        :style=`{
            height: '60px',
            borderRadius: '10px',
            overflow: 'hidden',
          }`
      ).row.full-width.items-center.content-center.menu-item.cursor-pointer
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-icon(size="37px" name="help_outline" color="grey-5")
        div(v-if="!mini").col.full-height
          .row.fit.items-center.content-center
            span(:style=`{fontSize: '18px', lineHeight: 1.1}`).text-grey-5.text-bold {{$t('Как это работает')}}
      //- docs
      .row.full-width.q-mt-sm
        kalpa-docs(
          v-if="!mini"
          :textAlign="'center'"
          :style=`{
            maxWidth: '210px',
          }`).q-py-sm
      //- version
      div(v-if="!mini").row.full-width.items-center
        small(
          :style=`{userSelect: 'none', marginLeft: '0px'}`
        ).text-grey-9 {{$t('Версия') + ': ' + $store.state.core.version + ' - ' + $store.state.core.buildDate}}
</template>

<script>
import kalpaDocs from 'src/components/kalpa_docs/index.vue'

export default {
  name: 'kalpaMenu',
  components: {
    kalpaDocs
  },
  props: {
    mini: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      addItemMenuShow: false,
      itemEditorShow: false,
    }
  },
  computed: {
    pages () {
      return [
        {
          id: 'home',
          name: this.$t('Home'),
          icon: 'home',
          action: () => {
            this.$eventBus.$emit('btn-home-clicked')
            this.$go('/home')
          }
        },
        {
          id: 'trends',
          name: this.$t('Search'),
          icon: 'search',
          action: () => {
            this.$eventBus.$emit('btn-trends-clicked')
            this.$go('/trends')
          }
        },
        {
          id: 'workspace',
          name: this.$t('Workspace'),
          icon: 'construction',
          action: () => {
            this.$eventBus.$emit('btn-workspace-clicked')
            this.$go('/workspace')
          }
        },
        {
          id: 'notifications',
          name: this.$t('Activity'),
          icon: 'notifications_none',
          action: () => {
            this.$eventBus.$emit('btn-notifications-clicked')
            this.$go('/notifications')
          }
        },
        {
          id: 'settings',
          name: this.$t('Settings'),
          icon: 'settings',
          action: () => {
            this.$eventBus.$emit('btn-settings-clicked')
            this.$go('/settings')
          }
        }
      ]
    }
  },
  methods: {}
}
</script>
