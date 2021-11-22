<template lang="pug">
div(
  :style=`{
  //- height: '50px',
  order: orderHeader,
}`
).row.full-width.items-center.content-center
  //report
  q-dialog(
    v-model="data.reportShow"
    :maximized="false")
    kalpa-report(:essence="essence")
  //hide
  q-dialog(
    v-model="data.hideShow"
    :maximized="false")
    kalpa-hide(:essence="essence")
  //- user VOTED
  q-btn(
    v-if="showAuthorAlways || essence.rateUser !== null"
    :to="'/user/'+essence.author.oid"
    round flat color="white" no-caps
  ).row.q-pl-sm
    img(
      draggable="false"
      :src="essence.author.thumbUrl"
      :style=`{
      width: '24px', minWidth: '24px', maxWidth: '24px',
      height: '24px', minHeight: '24px', maxHeight: '24px',
      borderRadius: '50%',
    }`)
    .col
      div(
        :style=`{
        maxWidth: '200px',
      }`
      ).row.full-width.items-center.content-center.q-px-sm.q-mb-xs.scroll
        .row.full-width.no-wrap
          span(:style=`{whiteSpace: 'nowrap'}`).text-grey-4 {{ essence.author.name }}
        //- .row.full-width
          small(:style=`{lineHeight: 0.5}`).text-grey-6 @username
  //- user NOT voted
  div(
    v-else
    :style=`{
    height: '40px',
  }`
  ).row.items-center.content-center.q-pa-sm
    div(:style=`{width: '24px',minWidth: '24px',height: '24px',minHeight: '24px',borderRadius: '50%',}`).b-40.q-mr-sm
    .col
      div(:style=`{width: '100px', minWidth: '100px', height: '14px', borderRadius: '10px'}`).b-40
      //- div(:style=`{width: '70px', minWidth: '70px', height: '10px', borderRadius: '10px',marginTop:'3px'}`).b-40
  .col
  .row.items-center.content-center.justify-end
    small(:style=`{lineHeight: 0.6}`).text-grey-8 {{ essence.countStat.countViews }}
    q-icon(name="visibility" size="10px" color="grey-8").q-mx-xs
    small(:style=`{lineHeight: 0.6}`).text-grey-8 {{ $date(essence.createdAt, 'DD.MM.YYYY') }}
    //- .row.full-width.items-center.content-center.justify-end
      q-icon(name="visibility" color="grey-8").q-mr-xs
      small(:style=`{lineHeight: 0.6}`).text-grey-8 {{ essence.countStat.countViews }}
  kalpa-menu-actions(
    v-if="showActions"
    icon="more_vert"
    color="grey-8"
    :actions="actions")
</template>

<script>
import { ObjectApi } from 'src/api/object'
import { UserRoleEnum } from 'src/api/user'
// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
import kalpaReport from 'src/components/kalpa_report/index.vue'
import kalpaHide from 'src/components/kalpa_hide/index.vue'
import {assert} from '../../../system/common/utils';
import { reactive } from 'vue'
export default {
  name: 'essenceHeader',
  components: {
    kalpaReport,
    kalpaHide
  },
  props: {
    essence: {type: Object, required: true},
    itemState: {
      type: Object,
      default () {
        return {}
      }
    },
    showAuthorAlways: {type: Boolean, default: false},
    showActions: {type: Boolean, default: true},
  },
  computed: {
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      // if (!this.itemState) this.itemState = {} // нельзя модифицировать проперти
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          reportShow: false,
          hideShow: false
        }))
      }
      return this.itemState[key]
    },
    essenceIsMine () {
      return this.essence.author.oid === this.$store.getters.currentUser.oid
    },
    actions () {
      let res = {
        copyLink: {
          name: this.$t('Copy Link'),
          cb: async () => {
            this.$log('copyLink')
            // TODO: handle copy link...
          }
        },
        // goThreads: {
        //   name: this.$t('Go threads'),
        //   cb: async () => {
        //     this.$log('goThreads')
        //     this.$router.push('/sphere-threads/' + this.essence.sphereFromName.oid)
        //   }
        // },
        // goGraph: {
        //   name: this.$t('Go graph'),
        //   cb: async () => {
        //     this.$log('goGraph')
        //     if (this.essence.items.length === 1) {
        //       this.$router.push(`/graph/${this.essence.oid}`)
        //     }
        //     else {
        //       this.$router.push(`/graph/${this.essence.items[0].oid}?oid=${this.essence.oid}`)
        //     }
        //   }
        // }
      }
      if (this.$store.getters.isGuest) {
        return res
      }
      if (this.$store.getters.currentUser.profile.role.in(UserRoleEnum.MODERATOR, UserRoleEnum.ADMIN)) {
        res.hideGlobal = {
          name: this.$t('hide global'),
          color: 'red',
          cb: async () => {
            this.$log('hideGlobal...')
            await ObjectApi.hide(this.essence.oid)
          }
        }
      }
      if (this.essenceIsMine || this.$store.getters.currentUser.profile.role.in(UserRoleEnum.MODERATOR, UserRoleEnum.ADMIN)) {
        res.delete = {
          name: this.$t('Delete'),
          color: 'red',
          cb: async () => {
            this.$log('essenceDelete...')
            await ObjectApi.unPublish(this.essence.oid)
          }
        }
      } else {
        res.hide = {
          name: this.$t('Hide'),
          color: 'white',
          cb: async () => {
            this.$log('hide...')
            // await this.$rxdb.hideObjectOrSource(this.essence.oid, null)
            this.data.hideShow = true
          }
        }
        res.report = {
          name: this.$t('Report'),
          color: 'red',
          cb: () => {
            this.$log('report...')
            // let reason = prompt(this.$t('Why?'))
            this.data.reportShow = true
          }
        }
      }
      if (
          this.essence.hasChanges &&
          this.essence.type === 'BLOCK' &&
          (
              this.essence.author.oid === this.$store.getters.currentUser.oid ||
              this.essence.members.find(m => m.oid === this.$store.getters.currentUser.oid)
          )
      ) {
        res.update = {
          name: this.$t('Update'),
          color: 'green',
          cb: async () => {
            this.$log('essenceUpdate...')
            await ObjectApi.blockUpdate(this.essence)
          }
        }
      }
      return res
    }
  },
  mounted () {
    this.$log('mounted', this.itemState)
  }
}
</script>
