<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        div(:style=`{height: '60px',borderRadius: '10px', overflow: 'hidden',}`
          ).row.full-width.items-center.content-center.b-40.q-px-sm
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="link" color="white" size="30px").q-mr-sm.q-my-xs
          div(:style=`{overflowX: 'auto'}`).col
            span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ title }}
          kalpa-bookmark(
            v-if="joint"
            :oid="joint.oid"
            type="JOINT"
            :name="joint.name"
            :thumbUrl="joint.thumbUrl"
            :isActive="true")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        joint-feed(v-if="joint" :joint="joint")
        .row.full-width.q-px-md.q-mt-xl
          q-tabs(
            v-model="viewId"
            dense active-color="green"
            no-caps :switch-indicator="false"
            ).full-width.text-grey-6
            q-tab(name="gallery" label="Gallery")
            q-tab(name="graph" label="Graph")
        .row.full-width.justify-center
          joint-joints(v-if="joint" :joint="joint")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_joint',
  components: {
    jointJoints: () => import('./joint_joints.vue')
  },
  data () {
    return {
      viewId: 'gallery',
      joint: null
    }
  },
  computed: {
    title () {
      if (this.joint) {
        if (this.joint.jointType === 'ASSOCIATIVE') return ''
        else return this.joint.name
      }
      else return ''
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.joint = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
}
</script>
