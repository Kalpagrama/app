<template lang="pug">
div(:style=`{height: 'calc(var(--vh, 1vh) * 100)'}`).row.full-width.bg-grey-4
  k-dialog-bottom(ref="userSettingsDialog" mode="actions" :options="userSettingsDialogOptions" @action="userSettingsAction")
  q-dialog(v-if="user && user.subscriptions !== null" ref="followingDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    .col.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width.bg-white
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round @click="$refs.followingDialog.toggle()" flat color="accent" icon="arrow_back")
        .col.full-height
          .row.fit.items-center.q-px-md
            span.text-bold.text-black Following
      .col.fit.bg-grey-2.q-px-sm.q-py-sm
        div(
          @click="subjectClick(f, fi)"
          v-for="(s, si) in user.subscriptions" :key="si"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          div(@click="" :style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
            img(@click="" :src="s.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
          div(@click="").col.full-height.q-ml-sm
            .row.fit.items-center
              span.text-caption {{ s.name | cut(50) }}
              //- small {{ s }}
          //- div(:style=`{}`).row.items-center.justify-center
            //- @click="subDelete(s, si)"
            q-btn(rounded outline dense no-caps
              :label=".includes(s.oid) ? 'Follow' : 'Unfollow'"
              :color="subsToDelete.includes(s.oid) ? 'accent' : 'red'"
              size="10px"  @click="subsToDelete.includes(s.oid) ? followClick(s, si) : unfollowClick(s, si)"
              :style=`{padding: '2px 5px'}`)
            //- q-btn( rounded outline dense label="follow" size="10px" color="green-7" @click="followClick(s, si)")
  q-dialog(v-if="user && user.subscribers !== null" ref="followersDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    .col.fit.bg-grey-2
      div(:style=`{height: '60px'}`).row.full-width.bg-white
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
          q-btn(round @click="$refs.followersDialog.toggle()" flat color="accent" icon="arrow_back")
        .col.full-height
          .row.fit.items-center.q-px-md
            span.text-bold.text-black Followers
      .col.fit.bg-grey-2.q-px-sm.q-py-sm
        div(
          @click="subjectClick(f, fi)"
          v-for="(f, fi) in user.subscribers" :key="fi"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
          div(:style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
            img(:src="f.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
          div(@click="").col.full-height.q-ml-sm
            .row.fit.items-center
              span.text-caption {{ f.name | cut(50) }}
  div(v-if="user").row.full-width.content-start
    //- header
    div(:style=`{height: '100px'}`).row.full-width.bg-primary
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(round @click="$router.back(1)" flat color="white" icon="arrow_back")
      .col
      .row
        div(style=`height: 60px; width: 60px`).row.items-center.justify-center
          q-btn(round flat @click="$refs.userSettingsDialog.show()" color="white" icon="more_vert")
        //- .row.full-width.justify-end.items-end.q-pb-sm.q-px-sm
          q-btn(@click="" rounded no-caps dense style=`height: 30px` color="grey" icon="").q-px-md Edit profile
    //- body
    .row.full-width.bg-grey-1.q-px-sm
      .row.full-width
        img(:src="user.thumbUrl" :style=`{width: '80px', height: '80px', marginTop: '-40px', borderRadius: '50%', overflow: 'hidden'}`)
        .col.row.justify-end.q-mt-sm
          //- q-btn(label="dev" @click="followUser()")
          q-btn(
            rounded dense no-caps
            v-if="myoid !== user.oid"
            @click="mySubscriptions.includes(user.oid) ? followUser(user.oid) : unfollowUser(user.oid)"
            :labal="mySubscriptions.includes(user.oid) ? 'Follow' : 'Unfollow'"
            :color="mySubscriptions.includes(user.oid) ? 'accent' : 'red'").q-px-md
      .row.full-width.items-center.justify-start
        .row.full-width
          span.text-bold.text-black.text-h6 {{ user.name }}
        .row.full-width
          .row.full-width
            small.text-grey Status
          .row.full-width.q-mt-xs
            small About
        div(@click="showInfo()").row.full-width
          span.text-accent {{text}} detailed information
          //- span {{ user.subscriptions }}
          span(v-if="mySubscriptions.includes(user.oid)") {{mySubscriptions}}
        div(v-if="showI").row.full-width.text-grey
          .row.full-width
            span Номер телефона
          .row.full-width
            span Почта
          .row.full-width
            span Язык
          .row.full-width
            span Страна
          .row.full-width
            span Город
          .row.full-width
            span Дата рождения
          .row.full-width
            span Пол
      .row.justify-start.items-center.q-mt-sm.q-py-sm
        //- Количество созданых ядер
        div(style=`width: 60px; height: 50px`).row.justify-center.items-center
          .row.full-width.justify-center
            small.text-h6.text-bold 0
          .row.full-width.justify-center
            small.text-grey.text-bold  Nodes
        //- Количество подписчиков
        div(style=`width: 60px; height: 50px` @click="$refs.followersDialog.show()").row.justify-center.items-center
          .row.full-width.justify-center
            span.text-h6.text-bold {{ countSubscribers }}
          .row.full-width.justify-center
            small.text-grey.text-bold Followers
        //- Количество подписок
        div(style=`width: 60px; height: 50px` @click="$refs.followingDialog.show()").row.justify-center.items-center
          .row.full-width.justify-center
            span.text-h6.text-bold {{ countSubscriptions }}
          .row.full-width.justify-center
            small.text-grey.text-bold  Following
    .col.fit.items-start.justify-center.br
      k-colls(v-if="coll" @coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :style=`{height: height+'px'}`).bg-grey-3
        template(v-slot:nodes)
          k-page
            //- user-nodes(v-if="page === 'nodes' && user" :user="user")
</template>

<script>
import userNodes from './user_nodes'
import userChains from './user_chains'
import userSettings from './user_settings'
import userWorkspace from './user_workspace'

export default {
  name: 'pageApp__User',
  components: {userNodes, userChains, userSettings, userWorkspace},
  data () {
    return {
      user: null,
      page: 'nodes',
      showI: false,
      coll: undefined,
      colls: [
        {name: 'nodes'}
      ]
    }
  },
  computed: {
    text () {
      if (this.showI === true) return 'Close'
      else return 'Show'
    },
    countSubscribers () {
      if (this.user && this.user.subscribers === null) return 0
      else return this.user.subscribers.length
    },
    countSubscriptions () {
      if (this.user && this.user.subscriptions === null) return 0
      else return this.user.subscriptions.length
    },
    myoid () {
      return this.$store.state.user.user.oid
    },
    mySubscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    },
    userSettingsDialogOptions () {
      return {
        confirm: false,
        actions: {
          edit: {name: 'Edit'},
          share: {name: 'Share'},
          copy: {name: 'Copy Url'},
          block: {name: 'Block'},
          report: {name: 'Report', color: 'red'}
        }
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$logD('$route CHANGED', to)
        if (to.params.oid) {
          this.$logD('GOT USER OID', to.params.oid)
          this.user = await this.userLoad(to.params.oid)
          this.page = 'nodes'
        } else {
          this.$logD('NO USER OID!')
          this.$router.push({params: {oid: this.$store.state.auth.user.oid}})
        }
      }
    }
  },
  methods: {
    showInfo() {
      this.showI = !this.showI
    },
    subjectClick (s) {
      this.$logD('subjectClick')
      switch (s.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/app/content/${s.oid}`)
          break
        }
        case 'USER': {
          if (this.user.oid === s.oid) this.$refs.followingDialog.toggle()
          else this.$router.push(`/app/user/${s.oid}`)
          break
        }
        case 'SPHERE': {
          this.$router.push(`/app/sphere/${s.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/app/node/${s.oid}`)
          break
        }
      }
    },
    userSettingsAction (a) {
      this.$logD('userSettingsAction', a)
      switch (a) {
        case 'report': {
          break
        }
        case 'block': {
          break
        }
        case 'copy': {
          break
        }
        case 'share': {
          break
        }
        case 'edit': {
          break
        }
      }
    },
    // async subscribers () {
    //   let res = await this.$store.dispatch('objects/get', { oid, fragmentName: 'userFragment', priority: 0 })
    //   this.$logD('res', res)
    // },
    async followUser () {
      let res = await this.$store.dispatch('subscriptions/subscribe', this.user.oid)
      this.$logD('res', res)
    },
    async unfollowUser () {
      try {
        this.$logD('subDelete start')
        let res = await this.$store.dispatch('subscriptions/unSubscribe', this.user.oid)
        this.$logD('res', res)
        // this.$delete(this.userSubscriptions, ss)
        this.$logD('subDelete done')
      } catch (error) {
        this.$logD('subDelete error', error)
      }
    },
    async userLoad (oid) {
      this.$logD('userLoad start')
      let user = await this.$store.dispatch('objects/get', { oid, fragmentName: 'userFragment', priority: 0 })
      // return user
      // let {data: {userLoad: [user]}} = await this.$apollo.query({
      //   query: gql`
      //     query userLoad ($oid: OID!) {
      //       objectList(oids: [$oid]) {
      //         oid
      //         type
      //         name
      //         thumbUrl(preferWidth: 50)
      //         createdAt
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid
      //   }
      // })
      this.$logD('userLoad done', user)
      return user
    },
    // pageClick (p) {
    //   this.$logD('pageClick', p)
    //   this.$router.push({params: {page: p.id}})
    // },
    // pageBtnClass (p) {
    //   if (this.page) {
    //     return {
    //       'bg-grey-5': this.page.id === p.id,
    //       'text-white': this.page.id === p.id
    //     }
    //   }
    // },
    // menuAddClick (a, ai) {
    //   this.$logD('menuAddClick')
    //   switch (a.id) {
    //     case 'node': {
    //       this.$router.push('/app/create/node')
    //       break
    //     }
    //     case 'chain': {
    //       this.$router.push('/app/create/chain')
    //       break
    //     }
    //   }
    // },
    avatarError (e) {
      // this.$logD('avatarError', e)
      e.target.src = 'statics/logo.png'
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
