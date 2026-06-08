using GameStore.Api.Data;
using GameStore.Api.Dtos;
using GameStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameStore.Api.Endpoints;

public static class GamesEndpoints
{
    const string GetGameEndpointName = "GetGame";
    private static readonly List<GameSummaryDto> games = [
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

    public static void MapGamesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/games");
        //Get games
        group.MapGet("/", async (GameStoreContext dbContext) 
            => await dbContext.Games
                            .Include(game => game.Genre)
                              .Select(game => new GameSummaryDto(
                                    game.Id,
                                    game.Name,
                                    game.Genre!.Name,
                                    game.Price,
                                    game.ReleaseDate
                                ))
                                .AsNoTracking()
                                .ToListAsync()
                                );


        //Get specific games
        group.MapGet("/{id}", async (int id, GameStoreContext dbContext) =>
        {
            var game = await dbContext.Games.FindAsync(id);
            return game is null ? Results.NotFound() : Results.Ok(
                new GameDetailsDto(
                    game.Id,
                    game.Name,
                    game.GenreId,
                    game.Price,
                    game.ReleaseDate
                )
            );
        }).WithName(GetGameEndpointName);

        //Post games
        group.MapPost("/", async (CreateGameDto newGame, GameStoreContext dbContext) =>
        {
            Game game = new()
            {
                Name = newGame.Name,
                GenreId = newGame.GenreId,
                Price = newGame.Price,
                ReleaseDate = newGame.ReleaseDate
            };

            dbContext.Games.Add(game);
            await dbContext.SaveChangesAsync();

            GameDetailsDto gameDto = new(
                game.Id,
                game.Name,
                game.GenreId,
                game.Price,
                game.ReleaseDate
            );

            return Results.CreatedAtRoute(GetGameEndpointName, new { id = game.Id }, game);

        });

        //Put games
        group.MapPut("/{id}", (int id, UpdateGameDto updatedGame) =>
        {
            var index = games.FindIndex(game => game.Id == id);

            if (index == -1) return Results.NotFound();

            games[index] = new GameSummaryDto(
                id,
                updatedGame.Name,
                updatedGame.Genre,
                updatedGame.Price,
                updatedGame.ReleaseDate
            );

            return Results.NoContent();
        });

        //Delete games
        group.MapDelete("/{id}", (int id) =>
        {
            if (games.RemoveAll(game => game.Id == id) == 0)
            {
                return Results.NotFound();
            }
            else
            {
                return Results.NoContent();
            }
        });

    }
}
