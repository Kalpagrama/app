<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  video-composer(:composition="composition" :loading="loading" @cancel="$emit('cancel')")
  //- image composer
  //- book composer
  //- html composer
</template>

<script>
import videoComposer from './video_composer'

export default {
  name: 'compositionEditor',
  components: { videoComposer },
  props: ['composition', 'saving']
}
</script>
