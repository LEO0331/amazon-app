export const ratings = [
    {
      name: '4stars & up',
      rating: 4
    },
    {
      name: '3stars & up',
      rating: 3
    },
    {
      name: '2stars & up',
      rating: 2
    },
    {
      name: '1stars & up',
      rating: 1
    }
];

export const prices = [
    {
      name: 'Any',
      min: 0,
      max: 0
    },
    {
      name: `$1 to $10`,
      min: 1,
      max: 10
    },
    {
      name: `$10 to $100`,
      min: 10,
      max: 100
    },
    {
      name: `$100 to $1000`,
      min: 100,
      max: 1000
    }
];

export const resolveAssetUrl = (assetPath) => {
    if (!assetPath) {
        return assetPath;
    }

    if (/^https?:\/\//i.test(assetPath)) {
        return assetPath;
    }

    if (assetPath.startsWith('/images/')) {
        const base = import.meta.env.BASE_URL || '/';
        const normalizedBase = base.endsWith('/') ? base : `${base}/`;
        return `${normalizedBase}${assetPath.replace(/^\//, '')}`;
    }

    return assetPath;
};
