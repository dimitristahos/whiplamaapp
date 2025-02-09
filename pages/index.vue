<script setup>
  const collection = ref([]);

  const { fetchPosts, generatePosts } = useFetchPosts();
  const { init, cleanup, setLoading } = useInfiniteScroll({
    threshold: 1000,
    throttleDelay: 1000,
    onTrigger: async () => {
      await generatePosts();
      collection.value = await fetchPosts();
    },
  });

  const currentCategory = ref("All");

  const categories = computed(() => {
    const postCategories = collection.value
      .map((post) => post.category)
      .filter((category, index, categories) => categories.indexOf(category) === index);
    return ["All", ...postCategories];
  });

  const blogPosts = computed(() => {
    if (currentCategory.value === "All") {
      return collection.value;
    } else {
      return collection.value.filter((post) => post.category === currentCategory.value);
    }
  });

  onMounted(async () => {
    collection.value = await fetchPosts();
    init();
  });

  onBeforeUnmount(() => {
    cleanup();
  });
</script>

<template>
  <main class="max-w-[1625px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12">
    <section class="mb-12">
      <div class="headline mb-32">
        <h1 class="text-[7.5rem] font-[400]">News</h1>
        <div class="categories flex flex-wrap gap-2">
          <div v-for="category in categories" :key="category">
            <div
              @click="currentCategory = category"
              class="text-md font-medium cursor-pointer border border-black px-2 py-1"
              :class="{
                'rounded-2xl': category === 'All',
                'rounded-lg': category !== 'All',
                'bg-black text-[#f7edde]': category === currentCategory,
              }"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </div>

      <div class="mb-12">
        <TransitionGroup name="post" tag="div" class="relative" appear>
          <article
            v-for="(post, i) in blogPosts"
            :key="i"
            class="flex flex-col md:flex-row mb-[8px] justify-between post-item"
            style="align-items: stretch; gap: 8px"
          >
            <div class="flex-1 bg-[#f7edde] rounded-[24px] overflow-hidden transition-shadow duration-300 min-h-[245px]">
              <nuxtLink :to="post.UUID" class="flex flex-col lg:flex-row gap-[4rem] p-6 h-full">
                <div class="w-full h-full max-w-[500px]">
                  <div class="flex flex-col h-full">
                    <div class="flex items-center">
                      <p class="text-sm">{{ post.date }}</p>
                      <span class="mx-2">·</span>
                      <span class="text-sm">{{ post.readTime }}</span>
                    </div>
                    <p class="text-sm font-medium mb-auto">{{ post.author }}</p>

                    <div>
                      <span class="text-xs font-medium border border-black px-2 py-1 rounded">{{ post.category }}</span>
                    </div>
                  </div>
                </div>
                <div class="w-full">
                  <h2 class="lg:text-[2rem] leading-none mb-2">{{ post.title }}</h2>
                  <small class="text-gray-600 mb-4">{{ post.excerpt }}</small>
                  <div class="flex items-center justify-between mt-auto">
                    <div class="flex items-center">
                      <div></div>
                    </div>
                  </div>
                </div>
              </nuxtLink>
            </div>
            <div class="flex rounded-[24px] overflow-hidden h-[240px] md:w-[240px]">
              <img :src="post.image" alt="" class="object-cover h-full w-full" />
            </div>
          </article>
        </TransitionGroup>
      </div>
    </section>

    <div class="flex flex-col text-align-center items-center justify-center">
      <div class="relative">
        <div class="w-10 h-10 rounded-full border-4 border-gray-200"></div>
        <div class="absolute top-0 left-0 w-10 h-10">
          <div class="w-10 h-10 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
        </div>
      </div>
      <div class="mt-2 text-center">Fetching Posts...</div>
    </div>
  </main>
</template>

<style scoped>
  .post-item {
    transform-origin: center;
    transition: all 0.6s ease-out;
  }

  .post-enter-active,
  .post-leave-active {
    transition: all 0.6s ease-out;
  }

  .post-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }

  .post-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  /* For initial load animation */
  .post-move {
    transition: transform 0.6s ease-out;
  }
</style>
