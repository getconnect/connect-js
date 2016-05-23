import _ = require('underscore');
import Dataset = require('./dataset');

export function renderDataset(dataset: Dataset.TableDataset) {
    return template()({
        data: dataset
    });
}

function template() {
    return _.template(`\
        <div class="header-background"> </div>
        <div class="connect-table-scrolling-inner">
            <table cellspacing="0">
                <thead>
                    <tr>
                        <% _(data.headerRow).each(function(headerCell) { %>
                            <% if (headerCell.isInterval) { %>
                                <th class="isInterval"><span><%= headerCell.title %></span><%= headerCell.title %></th>
                            <% } else if (headerCell.isGrouped) { %>
                                <th class="isGrouped<% if (headerCell.isNumeric) { %> isNumeric <% } %>"><span><%= headerCell.title %></span><%= headerCell.title %></th>
                            <% } else { %>
                                <th <% if (headerCell.isNumeric) { %> class="isNumeric" <% } %>><span><%= headerCell.title %></span><%= headerCell.title %></th>
                            <% } %>
                        <% }) %>
                    </tr>
                </thead>
                <tbody>
                    <% _(data.contentRows).each(function(row) { %>
                        <tr>
                            <% _(row).each(function(cell) { %>
                                <% if (cell.isInterval) { %>
                                    <th class="isInterval"><%= cell.displayedValue %></th>
                                <% } else if (cell.isGrouped) { %>
                                    <th class="isGrouped <% if (cell.isNumeric) { %> isNumeric <% } %>"><%= cell.displayedValue %></th>
                                <% } else { %>
                                    <td <% if (cell.isNumeric) { %> class="isNumeric" <% } %>><%= cell.displayedValue %></td>
                                <% } %>
                            <% }) %>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
    `);
}
