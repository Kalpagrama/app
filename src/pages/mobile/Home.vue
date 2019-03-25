<template lang="pug">
  q-page
    grain(flat bordered v-for="(card, ix) in cards" :key="ix" :item="{id: card}" :ix="ix")
</template>

<style lang="stylus">

</style>

<script>
import grain from '../../components/Grain';

export default {
  name: 'PageMobileHome',
  components: {
      grain,
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
