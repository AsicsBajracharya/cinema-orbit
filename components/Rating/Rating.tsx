export function Rating({ value }: { value: number }) {
    const score = value.toFixed(1);
    return (
      <span>
        <span aria-hidden="true">★ {score}</span>
        <span className="sr-only">Rated {score} out of 10</span>
      </span>
    );
  }