export const useFetchPosts = () => {
  const fetchPosts = async () => {
    try {
      const response = await $fetch("/api/getArticles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const generatePosts = async () => {
    try {
      const response = await $fetch("/api/generate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          prompt: "Generate 4 articles",
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const generateRelatedPosts = async ($post) => {
    try {
      const response = await $fetch("/api/generate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          prompt: `Generate 2 articles to keep my user engaged based on this article: ${JSON.stringify($post)}`,
        },
      });

      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  return { fetchPosts, generatePosts, generateRelatedPosts };
};
