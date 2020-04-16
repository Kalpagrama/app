<style lang="sass">
.page-item
  &:hover
    background: #777 !important
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px'}`).bg-grey-10
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      top: '0px',
      zIndex: 1000,
      width: $store.state.ui.maxWidthMenu+'px',
      height: $q.screen.height+'px',
      right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '68px',
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.fit.bg-grey-9
      //- pages
      router-link(
        v-for="(p,pi) in pages" :key="p.id"
        :to=`{params: {page: p.id}}`
        :style=`{height: '50px'}`).row.full-width.items-center.content-center.q-px-md.page-item
        span.text-white {{ p.name }}
      //- spheres
      div(:style=`{height: '50px'}`).row.full-width.items-center.q-px-md
        span.text-white Related spheres
      .col.full-width.scroll
        .row.full-width.q-pa-sm
          sphere-spheres(v-if="user" :oid="user.oid")
  //- header
  q-header(v-if="false" reveal)
    .row.full-width.justify-center
      div(
        v-if="user"
        :style=`{
          height: '60px',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`
        ).row.full-width.items-center.content-center.justify-start.q-px-sm
        span.text-bold.text-white {{ user.name }}
        .row.full-width
          small.text-white @{{ user.name }}
  q-footer(reveal)
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px', borderRadius: '10px 10px 0 0'}`
        ).row.full-width.items-center.content-center.bg-grey-9.q-px-sm
        q-btn(
          round push color="green" icon="add"
          :style=`{position: 'absolute', zIndex: 100, top: '-20px', left: '50%', transform: 'translate(-50%, 0)', borderRadius: '50%'}`)
        q-btn(round flat color="grey-2" icon="menu")
        .col
        q-btn(round flat color="grey-2" icon="more_vert")
  q-page-container.row.fit.justify-center.bg-grey-10
    user-info(v-if="user" :user="user")
    user-created-nodes(
      v-if="$route.params.page === 'created'"
      :filter="{ types: ['NODE'], fastFilters: ['CREATED_BY_USER']}")
      //- template(v-slot:header)
        //- user-info(v-if="user" :user="user" :page="page" @page="page = $event")
</template>

<script>
import userInfo from './user_info'
import userFollowers from './user_followers'
import userFollowing from './user_following'
import userCreatedNodes from './user_created_nodes'
import userVotedNodes from './user_voted_nodes'

export default {
  name: 'pageApp__User',
  components: {userInfo, userVotedNodes, userCreatedNodes, userFollowing, userFollowers},
  props: ['width', 'height'],
  data () {
    return {
      user: null,
      // page: 'created',
      pages: [
        {id: 'created', name: 'Created'},
        {id: 'voted', name: 'Voted'},
        {id: 'followers', name: 'Followers'},
        {id: 'following', name: 'Following'}
      ]
    }
  },
  computed: {
    colorButton () {
      if (this.pageId === 'Created nodes') return 'bg-green'
      else return 'bg-white'
    },
    scroll () {
      if (window.scrollY > 100) return true
      else return false
    },
    include () {
      let find = this.mySubscriptions.find(s => s.oid === this.user.oid)
      if (find) return true
      else return false
    },
    colls () {
      return [
        {id: 'created', name: 'Created'},
        {id: 'rated', name: 'Rated'},
        {id: 'following', name: this.countSubscriptions + ' Following'},
        {id: 'followers', name: this.countSubscribers + ' Followers'}
      ]
    },
    myoid () {
      return this.$store.getters.currentUser.oid
    },
    countSubscribers () {
      if (this.user && this.user.subscribers === null) return 0
      else return this.user.subscribers.length
    },
    countSubscriptions () {
      if (this.user && this.user.subscriptions === null) return 0
      else return this.user.subscriptions.length
    },
    mySubscriptions () {
      return this.$store.getters.currentUser.subscriptions
    },
    userSettingsDialogOptions () {
      let options = {
        confirm: false,
        actions: {
          copy: {name: 'Copy Url'}
        }
      }
      if (this.$route.params.oid === this.myoid) {
        options.actions = {
          ...options.actions,
          edit: {name: 'Edit'},
          changePhoto: {name: 'Change photo'},
        }
      } else {
        options.actions = {
          ...options.actions,
          block: {name: 'Block'},
          report: {name: 'Report', color: 'red'}
        }
      }
      return options
    },
    userPhotoDialogOptions () {
      return {
        confirm: false,
        actions: {
          // makePhoto: {name: 'Make a photo'},
          download: {name: 'Download from device'}
        }
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.user = await this.userLoad(to.params.oid)
          if (!to.params.page) {
            this.$router.push({params: {page: 'created'}})
          }
        }
        else {
          this.$log('NO USER OID!')
          this.$router.push({params: {oid: this.$store.getters.currentUser.oid}})
        }
      }
    }
  },
  methods: {
    save () {
      this.changeStatus()
      this.changeAbout()
      this.editions = !this.editions
    },
    async changeAbout () {
      if (this.about !== this.currentAbout) {
        try {
          this.$log('changeAbout start')
          let res = await this.$store.dispatch('objects/update', {
            oid: this.$store.getters.currentUser.oid,
            path: 'profile.about',
            newValue: this.about
          })
          this.$log('changeAbout done', res)
        } catch (e) {
          this.$log('changeAbout ERROR', this.about)
        }
      }
    },
    async changeStatus () {
      if (this.status !== this.currentStatus) {
        try {
          this.$log('changeStatus start')
          let res = await this.$store.dispatch('objects/update', {
            oid: this.$store.getters.currentUser.oid,
            path: 'profile.status',
            newValue: this.status
          })
          this.$log('changeStatus done', res)
        } catch (e) {
          this.$log('changeStatus ERROR', this.status)
        }
      }
    },
    changePhoto () {
      if (this.myoid === this.user.oid) {
        this.$refs.userPhotoDialog.show()
      }
    },
    fileChanged (e) {
      this.$log(e.target.files)
      if (e.target.files.length === 1){
        this.file = e.target.files[0]
        this.downloadPhoto(this.file)
      } else throw new Error(`bad selected files len ${e.target.files.length}`)
    },
    userPhotoAction (a) {
      this.$logD('userPhotoAction', a)
      switch (a) {
        // case 'makePhoto': {
        //   break
        // }
        case 'download': {
          this.$refs.fileInput.click()
          break
        }
      }
    },
    async downloadPhoto (file) {
      try {
        this.$log('changePhoto start')
        let res = await this.$store.dispatch('objects/update', {
          oid: this.$store.getters.currentUser.oid,
          path: 'profile.photo',
          newValue: file
        })
      } catch (e) {
        this.$log('changePhoto ERROR', e)
      }
    },
    async userLoad (oid) {
      this.$log('userLoad start')
      let user = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('userLoad done', user)
      return user
    }
  },
  mounted () {
    this.$logD('mounted')
    this.$q.addressbarColor.set('#101d49')
    document.body.style.background = '#101d49'
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
