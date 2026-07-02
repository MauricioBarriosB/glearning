export default function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-default-500">Cargando...</p>
            </div>
        </div>
    );
}
