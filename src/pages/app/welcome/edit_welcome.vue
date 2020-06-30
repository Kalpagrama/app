<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  iframe(
    :src="url"
    :style=`{
      width: '100%',
      height: '100%',
    }`)
</template>

<script>
export default {
  name: 'editWelcome',
  data () {
    return {
      url: 'https://www.notion.so/kalpagramma/6cfe1538966942af8e9e247c9004260d'
    }
  }
}
</script>
