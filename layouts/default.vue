<script setup>
  const blogTitle = ref("To_Infinity.");
  const isMenuOpen = ref(false);

  const menuItems = ref([
    { name: "Home", href: "#" },
    { name: "Articles", href: "#" },
    { name: "Categories", href: "#" },
    { name: "About", href: "#" },
  ]);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="pt-7 sticky top-0 z-50">
      <nav class="mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between md:justify-start items-center h-16">
          <nuxtLink to="/" class="text-3xl font-[900]">{{ blogTitle }}</nuxtLink>
          <button @click="isMenuOpen = !isMenuOpen" class="md:hidden text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            class="hidden md:flex space-x-8 mx-auto p-4 rounded-full overflow-hidden"
            style="background: rgba(255, 255, 255, 0.5); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px)"
          >
            <a v-for="item in menuItems" :key="item.name" :href="item.href" class="0 hover:text-indigo-600">
              {{ item.name }}
            </a>
          </div>
        </div>
      </nav>
      <!-- Mobile menu -->
      <div v-if="isMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a
            v-for="item in menuItems"
            :key="item.name"
            :href="item.href"
            class="block px-3 py-2 text-base text-gray-500 hover:text-indigo-600"
          >
            {{ item.name }}
          </a>
        </div>
      </div>
    </header>

    <div>
      <slot />
    </div>
    <!-- Footer -->
    <footer class="bg-black rounded-t-[48px] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-[#f7edde]">
          <p>&copy; {{ new Date().getFullYear() }} {{ blogTitle }}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
