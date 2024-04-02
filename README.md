# Navigator

Welcome to Navigator, a modern navigation tool for React Native. Navigator embraces the power of the react-navigation library and enhances it with features designed to simplify your coding experience.

## Safer Navigation

Navigator provides a safer navigation experience by statically declaring callback invocations. This approach lets you immediately spot missing components or incorrect navigation paths, minimizing runtime errors.

## No More Zombie Navigation Actions

Forget about matching string route names with components--an error-prone task. Navigator shields you from potential runtime errors resulting from undeclared routes or leftover route names from refactoring. This means cleaner code and fewer headaches.

## Simplified Navigation Experience

Easily control your navigation logic with the Navigator hook right within your components. For an even cleaner setup, declare your navigation chains statically outside your components.

## How to Use

```tsx
<Navigator>
  <First
    onNavigate={(navigator) => {
      navigator.push(
        <Second
          onNavigate={(navigator) => {
            navigator.push(<Third />);
          }}
        />,
      );
    }}
  />
</Navigator>
```

Just define your entire navigation path outside your components in a clear and structured manner.

## Coming Soon: Web Support

Web support is in the works to ensure consistent and smooth navigation experiences across all platforms.

Jump into a new era of navigation with Navigator for a truly declarative navigation experience in your React Native projects!
