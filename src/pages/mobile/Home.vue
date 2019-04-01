<template lang="pug">
  q-page
    node-list(:source="cards")
</template>

<style lang="stylus">

</style>

<script>
import NodeList from '../../components/NodeList';

export default {
  name: 'PageMobileHome',
  components: {
      'node-list': NodeList,
  },
  data() {
      return {
          cards: [],
      };
  },
  beforeMount() {
      for (let i = 0; i < 20; i += 1) {
        this.cards.push(i);
      }
  },
};
</script>
