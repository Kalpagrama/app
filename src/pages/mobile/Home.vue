<template lang="pug">
  q-page
    news-feed
</template>

<style lang="stylus">

</style>

<script>
import NewsFeed from '../../components/news/NewsFeed';

export default {
  name: 'PageMobileHome',
  components: {
      NewsFeed,
  },
  data() {
      return {};
  },
};
</script>
