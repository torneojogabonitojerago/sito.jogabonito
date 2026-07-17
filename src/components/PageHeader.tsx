interface Props {
  title: string;
  brush: string;
}

export default function PageHeader({ title, brush }: Props) {
  return (
    <div className="relative pb-10 pt-28 text-center sm:pb-14 sm:pt-36">
      <div className="bg-fade-radial pointer-events-none absolute inset-0" />
      <h1 className="font-display title-glow relative text-5xl uppercase tracking-wide text-white sm:text-7xl">
        {title}
      </h1>
      <p className="font-brush brush-glow relative mt-1 -rotate-2 text-3xl text-primary sm:text-4xl">
        {brush}
      </p>
    </div>
  );
}
