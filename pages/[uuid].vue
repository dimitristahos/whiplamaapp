<script setup>
  const { generateRelatedPosts, fetchPosts } = useFetchPosts();

  const posts = await fetchPosts();

  const relatedPosts = ref([]);

  const $route = useRoute();
  const currentPost = ref({});

  const currentPostHeadline = computed(() => {
    return posts.find((post) => post.UUID === $route.params.uuid);
  });

  const getArticle = async () => {
    try {
      const data = await $fetch(`/api/getArticle/${$route.params.uuid}`, {
        method: "GET",
        query: {
          currentPostHeadline: currentPostHeadline.value,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      currentPost.value = data;
    } catch (error) {
      console.error(error);
    }
  };

  await getArticle();

  onMounted(async () => {
    const data = localStorage.getItem($route.params.uuid);
    const parsedData = JSON.parse(data ?? "[]");

    if (!parsedData.length) {
      relatedPosts.value = (await generateRelatedPosts(currentPost.value)) ?? [];
      localStorage.setItem($route.params.uuid, JSON.stringify(relatedPosts.value));
    } else {
      relatedPosts.value = parsedData;
    }
  });
</script>

<template>
  <main class="mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="back font-[600] mb-[64px]">
      <nuxtLink class="flex text-[.9375rem] items-center gap-2" to="/">
        <svg
          class="_icon_krovg9"
          xmlns="http://www.w3.org/2000/svg"
          style="width: 16px; height: 16px; fill: currentcolor"
          width="16"
          height="16"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M6.98352 4.07537L7.51385 3.54504L6.45319 2.48438L5.92286 3.01471L1.70402 7.23355C1.28095 7.65662 1.28095 8.34255 1.70402 8.76561L5.92286 12.9845L6.45319 13.5148L7.51385 12.4541L6.98352 11.9238L3.80919 8.74946H13.9979H14.7479V7.24946H13.9979H3.80943L6.98352 4.07537Z"
          ></path>
        </svg>
        NEWS</nuxtLink
      >
    </div>

    <!-- Article Header -->
    <article class="prose lg:prose-xl max-w-none">
      <div class="mb-8">
        <div class="flex lg:flex-row flex-col gap-[128px] mb-12">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 40px; gap: 128px">
            <div>
              <span class="text-lg font-medium border border-black px-2 py-1 rounded-lg"
                >{{ currentPostHeadline.category }}
              </span>
              <h1 class="text-[3.5rem] font-[500] leading-none mb-4 mt-12">{{ currentPostHeadline.title }}</h1>
            </div>
          </div>
          <div class="flex rounded-[24px] overflow-hidden" style="flex: 0 0 40vw">
            <img :src="currentPostHeadline.image" alt="" class="object-cover md:w-[40vw] md:h-[40vw]" />
          </div>
        </div>

        <div class="flex items-center text-xl space-x-4">
          <time>{{ currentPostHeadline.date }}</time>
        </div>
      </div>

      <!-- Author Bio -->
      <div class="author max-w-4xl mx-auto">
        <div class="my-16 p-8 bg-gray-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div>
              <small>Author:</small>
              <h3 class="text-lg font-medium text-gray-900">{{ currentPostHeadline.author }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Article Content -->
      <div class="content max-w-4xl mx-auto">
        <div class="space-y-6">
          <p v-for="(paragraph, index) in currentPost.content" :key="index" class="text-lg leading-relaxed">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <!-- Tags -->
      <div class="tags max-w-4xl mx-auto">
        <div class="mt-8 flex flex-wrap gap-2">
          <span v-for="tag in currentPost.tags" :key="tag" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            #{{ tag }}
          </span>
        </div>
      </div>
    </article>

    <!-- Related Posts -->
    <div v-if="relatedPosts.length" class="mt-16">
      <h2 class="text-2xl font-bold mb-8">Related Articles</h2>
      <div class="grid gap-8 md:grid-cols-2">
        <article v-for="(relatedPost, i) in relatedPosts" :key="i" class="bg-white rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="flex rounded-[24px] overflow-hidden h-60">
              <img :src="relatedPost.image" alt="" class="object-cover h-full w-full" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ relatedPost.title }}</h3>
            <p class="text-gray-600 mb-4">{{ relatedPost.excerpt }}</p>
            <nuxtLink :to="relatedPost.UUID" class="font-medium">Read more →</nuxtLink>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="flex flex-col text-align-center items-center justify-center mt-16">
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
