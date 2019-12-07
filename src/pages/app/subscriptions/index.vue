<template lang="pug">
q-layout(container :style=`{width: width+'px', height: height+'px'}`).column.bg-grey-3
  q-dialog(ref="subDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="sub = null")
    div(@click.self="$refs.subDialog.hide()").row.fit.justify-center.items-start.q-py-xl.q-px-sm
      div(:style=`{maxWidth: '500px', borderRadius: '10px', overflow: 'hidden'}`).column.fit.bg-white
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pa-md
            span {{ $t(sub) }}
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.bg-white
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round @click="$router.back(1)" flat color="accent" icon="arrow_back")
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold.text-black {{$t('Subscriptions')}}
      //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      //-   q-btn(round flat icon="edit" color="green" @click="editToggle()")
  q-page-container.fit
    q-page.fit
      k-dialog-bottom(ref="subDialog" mode="actions" :options="subDialogOptions" @action="subDialogAction")
      div(v-if="subscriptions.length === 0").row.fit.justify-center.bg-white.q-py-xl
        span.text-grey.text-h6 {{$t('You dont have subscriptions.')}}
      .row.full-width.items-start.content-start.justify-center.q-pa-md
        div(:style=`{maxWidth: '500px'}`).row.full-width
          div(
            v-for="(s, si) in subscriptions" :key="si"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.q-mb-sm.bg-white.cursor-pointer.q-px-sm
            div(@click="subjectClick(s)" :style=`{height: '40px', width: '40px'}`).row.items-center.justify-center
              img(@click="" :src="s.thumbUrl" :style=`{height: '40px', width: '40px', borderRadius: '50%'}`)
            div(@click="subjectClick(s)").col.full-height.q-ml-sm
              .row.fit.items-center
                span.text-caption {{ $t(s.name | cut(50)) }}
                //- small {{ s }}
            div(:style=`{}`).row.items-center.justify-center
              //- @click="subDelete(s, si)"
              q-btn(rounded outline dense no-caps
                :label="subsToDelete.includes(s.oid) ? 'Follow' : 'Unfollow'"
                :color="subsToDelete.includes(s.oid) ? 'accent' : 'red'"
                size="10px"  @click="subsToDelete.includes(s.oid) ? followClick(s, si) : unfollowClick(s, si)"
                :style=`{padding: '2px 5px'}`)
              //- q-btn( rounded outline dense label="follow" size="10px" color="green-7" @click="followClick(s, si)")
</template>

<script>
export default {
  name: 'pageApp__subscriptions',
  props: ['width', 'height'],
  data () {
    return {
      sub: null,
      follow: false,
      label: 'unfollow',
      color: 'red-7',
      subIndex: undefined,
      subsToDelete: []
    }
  },
  computed: {
    subscriptions () {
      return this.$store.state.subscriptions.userSubscriptions
    },
    subDialogOptions () {
      return {
        header: false,
        headerName: 'slkdmflksd',
        actions: {
          unfollow: {name: 'Unfollow', color: 'red'}
        },
        confirm: true,
        confirmName: 'Cancel'
      }
    }
  },
  methods: {
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
          this.$router.push(`/app/user/${s.oid}`)
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
    subDialogAction (action) {
      this.$logD('subDialogAction', action)
      switch (action) {
        case 'header': {
          break
        }
        case 'unfollow': {
          // TODO: some shit
          this.subsToDelete.push(this.subscriptions[this.subIndex].oid)
          // this.subscriptionsDelete()
          break
        }
        case 'confirm': {
          break
        }
      }
    },
    // subscriptionsDelete (s, si) {
    //   this.$logD('deleteActionStart', s)
    //   if (this.subsToDelete) {
    //     setTimeout(() => this.$store.dispatch('subscriptions/unSubscribe', s.oid), 500);
    //   }
    // },
    followClick (s, si) {
      this.$logD('followClick', s)
      this.follow = !this.follow
      this.subIndex = si
      // this.subsToDelete.splice(this.subsToDelete.length - this.subIndex.oid, 1);
      this.subsToDelete = this.subsToDelete.filter((sub) => sub !== s.oid)
    },
    unfollowClick (s, si) {
      this.$logD('unfollowClick', s)
      this.subIndex = si
      this.$refs.subDialog.show()
    },
    async subClick (s, si) {
      this.$logD('subClick')
      this.subIndex = si
      this.sub = s
      this.$refs.subDialog.show()
    },
    async subDelete (s, si) {
      try {
        this.$logD('subDelete start')
        let res = await this.$store.dispatch('subscriptions/unSubscribe', s.oid)
        this.$logD('res', res)
        // this.$delete(this.userSubscriptions, ss)
        this.$logD('subDelete done')
      } catch (error) {
        this.$logD('subDelete error', error)
      }
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
    this.subsToDelete.map((sub) => {
      this.subDelete({oid: sub})
    })
  }
}
</script>
