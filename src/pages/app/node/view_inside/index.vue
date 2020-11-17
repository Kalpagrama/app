<template lang="pug">
.row.full-width
  //- span.text-white view inside
  div(
    v-for="(item,ii) in items" :key="item.id"
    :style=`{}`
    ).row.full-width
</template>

<script>
export default {
  name: 'viewInside',
  data () {
    return {
      items: [
        {id: '1', name: 'i am first', items: []},
        {id: '2', name: 'its 2', items: []},
        {
          id: '3',
          name: 'Three',
          items: [
            {id: '31', name: 'three is good !', items: []},
            {
              id: '32',
              name: 'three is bad !',
              items: [
                {id: '321', name: 'Yes!', items: []}
              ]
            }
          ]
        }
      ]
    }
  }
}
</script>
