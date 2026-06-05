using GameStore.Api.Dtos;

const string GetGameEndpointName = "GetGame";

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<GameDto> games = [
    new(
        1,
        "Forza Horizon 3",
        "Racing",
        200.99m,
        new DateOnly(2000, 7, 15)
    ),
    new(
        2,
        "Forza Horizon 4",
        "Racing",
        200.99m,
        new DateOnly(2010, 7, 15)
    ),
    new(
        3,
        "Forza Horizon 6",
        "Racing",
        200.99m,
        new DateOnly(2026, 7, 15)
    ),
];

//Get games
app.MapGet("/games", () => games);


//Get specific games
app.MapGet("/games/{id}", (int id) => games.Find(game => game.Id == id))
   .WithName(GetGameEndpointName);

//Post games
app.MapPost("/games", (CreateGameDto newGame) =>
{
    GameDto game = new(
        games.Count + 1,
        newGame.Name,
        newGame.Genre,
        newGame.Price,
        newGame.ReleaseDate
    );

    games.Add(game);

    return Results.CreatedAtRoute(GetGameEndpointName, new{id = game.Id}, game);

});

//Put games
app.MapPut("/games/{id}", (int id, UpdateGameDto updatedGame) => {
    var index = games.FindIndex(game => game.Id == id);

    games[index] = new GameDto(
        id,
        updatedGame.Name,
        updatedGame.Genre,
        updatedGame.Price,
        updatedGame.ReleaseDate
    );

    return Results.NoContent();
});

app.Run();
