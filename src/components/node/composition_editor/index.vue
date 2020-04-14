<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- div(:style=`{}`)
  video-composer(:content="content" :composition="composition" @cancel="$emit('cancel')")
  //- image composer
  //- book composer
  //- html composer
</template>

<script>
import videoComposer from './video_composer'

export default {
  name: 'compositionEditor',
  components: { videoComposer },
  props: {
    saving: {type: Boolean},
    composition: {type: Object},
    content: {type: Object}
  }
}
</script>
